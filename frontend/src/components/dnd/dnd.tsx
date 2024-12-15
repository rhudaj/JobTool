import { DropTargetMonitor, useDrag, useDragLayer, useDrop } from "react-dnd";
import "./dnd.scss";
import React, { useEffect } from "react";
import { useImmer } from "use-immer";
import { useLogger } from "../../hooks/logger";
import { DeleteButton } from "./controls/delete";
import { joinClassNames } from "../../hooks/joinClassNames";

interface Item {
	id: any;
	value: any;		// can't be a JSX element. Anything else is fine.
};

interface Bucket {
	id: any;
	items: Item[];
};

const DEFAULT_ITEM_TYPE = "DRAG-ITEM";

// TODO: should be usable on its own (ie: has its own state) in the case you dont want a bucket.
function DragDropItem(props: {
	item: Item,
	children: JSX.Element,
	item_type?: string,
	onHover?: (dragId: string, isBelow: boolean, isRight: boolean) => void,
	onLetGo?: (dragId: any, bucketId: any) => void, // send to parent when you drop on a bucket
	onDelete?: (id: any) => void,
	canDrag?: boolean		// defaults to true
	canBeTarget?: boolean 	// defaults to true
}) {


	const log = useLogger("DragDropItem");

	// -------------------- STATE ---------------------

	const ref = React.useRef(null);

	// -----------------DRAG FUNCTIONALITY-----------------

    const [{isDragging}, drag] = useDrag(() => ({
		type: props.item_type ?? DEFAULT_ITEM_TYPE,
		canDrag: props.canDrag != false,
		item: () => {
			log("Started to drag.");
			return props.item; 			// sent to the drop target when dropped.
		},
		end: (item: Item, monitor) => {
			const dropResult: {id: any} = monitor.getDropResult();
			if (!dropResult)
				// Cancelled or invalid drop
				return;
			log("Drop result:", dropResult);
			props.onLetGo(item.id, dropResult.id);
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		}),
		}), [props.item, props.onHover]
	);

	// -----------------DROP FUNCTIONALITY-----------------

	const [{isDropTarget}, dropRef] = useDrop(
		() => ({
			accept: props.item_type ?? DEFAULT_ITEM_TYPE,
			canDrop: (dropItem: Item) => {
				return (props.canBeTarget != false) && (dropItem.id !== props.item.id);
			},
			drop: () => props.item,
			hover: (dragItem: Item, monitor) => {

				if ( !props.onHover || dragItem.id === props.item.id )
					return;

				const rect = ref.current.getBoundingClientRect();
				const dragPos = monitor.getClientOffset();

				props.onHover(dragItem.id,
					(dragPos.y - rect.top) > (rect.bottom - rect.top)/2, 	// is it below?
					(dragPos.x - rect.left) > (rect.right - rect.left)/2	// is it right?
				);
			},
			collect: (monitor) => ({
				isDropTarget: monitor.canDrop() && monitor.isOver()
			}),
		}),
		[props.item, props.onHover]
	);

	// Inject the dnd props into the ref
	drag(dropRef(ref));

	// -----------------RENDER-----------------

	// Create the custom default layer

	const classNames = joinClassNames(
		"drag-drop-wrapper",
		isDragging ? "dragging" : "", isDropTarget ? "droppable": "",
		props.canDrag == false ? "no-drag" : "can-drag"
	)

	return (
		<>
			<div ref={ref} className={classNames}>
				{props.children}
			</div>
			{ props.onDelete && <DeleteButton ref={ref} onDelete={()=>props.onDelete(props.item.id)}/> }
		</>
	);
};


const useBucket = (bucket?: Bucket) => {

	const [items, setItems] = useImmer<Item[]>(bucket?.items);

	// -----------------HELPERS-----------------

	const log = useLogger("useBucket");

	const getIdx = (id: any): number => {
		return items.findIndex((item) => item.id === id);
	};

	// -----------------STATE MODIFIERS-----------------

	/**
	 * Call assumes item is not already in the bucket.
	 */
	const addItem = (item: Item, atIndex?: number) => {
		log("Adding item:", item);
		setItems(draft => {
			if (atIndex) 	draft.splice(atIndex, 0, item);
			else 			draft.push(item);
		})
	};

	const moveItem = (indexBefore: number, indexAfter: number) => {
		log(`Moving item from ${indexBefore} to ${indexAfter}`);
		setItems(draft => {
			const [movedItem] = draft.splice(indexBefore, 1);
			draft.splice(indexAfter, 0, movedItem);
		});
	};

	const removeItem = (id: any) => {
		log("Removing item:", id);
		setItems(draft => {
			draft.splice(getIdx(id), 1);
		});
	};

	const changeItemValue = (id: any, newValue: any) => {
		log("Changing item value:", id);
		setItems(draft => {
			draft[getIdx(id)].value = newValue;
		});
	};

	return { items, setItems, addItem, moveItem, removeItem, changeItemValue };
};

let count = 0; // for assigning unique ids to items
function BucketComponent(props: {
	id: any,
	values: any[],
	children: JSX.Element[],
	isVertical: boolean,
	DisplayItems: (props: {children: JSX.Element[]}) => JSX.Element,
	item_type?: string,
	onUpdate?: (newValues: any[]) => void
	deleteItemsDisabled?: boolean,
}) {

	useEffect(() => {
		console.log(`BucketComponent ${props.id} new values:`, props.values);
	}, [props.values]);

	// -----------------STATE-----------------

	const { items, setItems, addItem, moveItem, removeItem, changeItemValue } = useBucket({
		id: props.id,
		items: props.values.map(v => ({ id: count++, value: v }))
	});

	React.useEffect(() => {
		// If item ids are not provided (only values), use the value as the id.
		let bucket: Bucket = {
			id: props.id,
			items: props.values.map(v => ({ id: count++, value: v }))
		};
		setItems(bucket.items);
	}, [props.values])

	// Called whenever INTERNAL state changes:
	React.useEffect(()=>{
		const newValues = items.map(I=>I.value);
		// Only call the callback if the values have changed
		if (JSON.stringify(newValues) === JSON.stringify(props.values))	// shallow comparison
			return;
		if (props.onUpdate) props.onUpdate(newValues); // && items != bucket.items
	}, [items])

	// -----------------DND RELATED-----------------

	const [hoveredGap, setHoveredGap] = React.useState<number|undefined>(undefined);

	// Helpers to get the get the gap index from the item index
	const prevGap = (itemIndex: number) => itemIndex;
	const nextGap = (itemIndex: number) => itemIndex + 1;

	const onBucketItemHover = (hoverId: string, dragId: string, isPastHalf: boolean) => {
		const hoveredIndex = items.findIndex((I) => I.id === hoverId);
		let gapIndex = isPastHalf ? nextGap(hoveredIndex) : prevGap(hoveredIndex);
		const dragIndex = items.findIndex((I) => I.id === dragId);
		const diff = dragIndex - gapIndex;

		// Is the gap is around the current dragItem ?
		if (diff == 0 || diff == -1)
			gapIndex = undefined;

		setHoveredGap(gapIndex);	// Only sets the new value if they differ (by VALUE)
	};

    const [{isHovered}, dropRef] = useDrop(
		() => ({
			accept: props.item_type ?? DEFAULT_ITEM_TYPE,
			drop: (dropItem: Item, monitor: DropTargetMonitor<Item, unknown>) => {
				// An item was dropped on the bucket (or a nested drop target).

				console.log("BUCKET: Dropped item:", dropItem);

				// drop was ON TOP of a nested item?
				const nestedDropTarget: any = monitor.getDropResult();

				// bucket ALREADY holds it?
				const itemIndex = items.findIndex((item) => item.id === dropItem.id);
				const notInBucket = (itemIndex === -1);

				if( nestedDropTarget?.id !== undefined ) {
					// => nested item handled the drop
					changeItemValue(nestedDropTarget.id, dropItem.value);
				} else if (notInBucket) {
					// Not in the bucket yet, so add it.
					addItem(dropItem, hoveredGap);
				} else if (moveItem) {
					// Its in the bucket already, and we've dropped it somewhere else inside
					// that's not over another item. So re-order.

					// CLAMP index between 0 and props.items.length-1
					let newIndex = Math.max(Math.min(hoveredGap, items.length - 1), 0)

					moveItem(itemIndex, newIndex);
				}
				// after drop, no need to display the gap
				if (hoveredGap !== undefined) setHoveredGap(undefined);

				// (optional) returned item will be the 'dropResult' and available in 'endDrag'
				return { id: props.id };
			},
			collect: (monitor) => ({
				isHovered: monitor.isOver()
			}),
    	}),
		// dependency array - if any of these values change, the above object will be recreated.
		[items, hoveredGap]
	);

	if (!isHovered && hoveredGap !== undefined) setHoveredGap(undefined);

	// -----------------RENDER-----------------

	function DropGap(props: {isActive: boolean}) {
		return <div className="drop-gap" hidden={!props.isActive}/>
	};

	const classNames = joinClassNames("bucket-wrapper", isHovered ? "hover" : "");

    return (
        <div ref={dropRef} className={classNames}>
			<props.DisplayItems>
				{
					items?.map((I: Item, i: number) => (
						<>
							{i == 0 && <DropGap isActive={hoveredGap===prevGap(i)}/>}
							<DragDropItem
								key={i}
								item={I}
								item_type={props.item_type}
								canBeTarget={true}
								onDelete={!props.deleteItemsDisabled && removeItem}
								onHover={ (dragId, isBelow, isRight) => {
									// What's considered next/prev item depends on orientation
									const isPastHalf = props.isVertical ? isBelow : isRight;
									onBucketItemHover(I.id, dragId, isPastHalf)
								}}
								onLetGo={(dragId: any, bucketId: any) => {
									// Remove the item if it was dropped on a different bucket
									if (bucketId !== props.id)
										removeItem(dragId);
								}}
							>
								{ props.children[i] }
							</DragDropItem>
							<DropGap key={`drop-gap-${i}`} isActive={hoveredGap===nextGap(i)} />
						</>
					))
				}
			</props.DisplayItems>

        </div>
    );
};

export { Item, Bucket, BucketComponent, DragDropItem }