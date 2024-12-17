import { DropTargetMonitor, useDrop } from "react-dnd";
import "./dnd.scss";
import React from "react";
import { useLogger } from "../../hooks/logger";
import { joinClassNames } from "../../hooks/joinClassNames";
import { Item, DEFAULT_ITEM_TYPE } from "./types";
import { useImmer } from "use-immer";
import DNDItem from "./Item";

const useBucket = (values: Item[]) => {

	const [items, setItems] = useImmer<Item[]>(values);

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

function DropGap(props: {isActive: boolean}) {
	return <div className="drop-gap" hidden={!props.isActive}/>
};

let count = 0; // for assigning unique ids to items
function ItemBucket(props: {
	id: any,
	values: any[],
	children: JSX.Element[],
	isVertical: boolean,
	displayItemsClass?: string,
	item_type?: string,
	onUpdate?: (newValues: any[]) => void
} & {
	// DISABLE OPTIONS (all default to false)
	deleteDisabled?: boolean,
	replaceDisabled?: boolean,
	dropDisabled?: boolean,
	deleteOnMoveDisabled?: boolean
}) {

	const log = useLogger(`ItemBucket (${props.id})`);

	// ----------------- STATE -----------------

	const { items, setItems, addItem, moveItem, removeItem, changeItemValue } = useBucket(
		props.values ?
			props.values.map(v => ({ id: count++, value: v })) :
			[]
	);

	React.useEffect(() => {
		// If item ids are not provided (only values), use the value as the id.
		setItems(
			props.values ?
				props.values?.map(v => ({ id: count++, value: v })) :
				[]
		);
	}, [props.values])

	// Called whenever INTERNAL state changes:
	React.useEffect(()=>{
		const newValues = items?.map(I=>I.value);
		// Only call the callback if the values have changed
		if (JSON.stringify(newValues) === JSON.stringify(props.values))	// shallow comparison
			return;
		if (props.onUpdate) props.onUpdate(newValues); // && items != bucket.items
	}, [items])

	// ----------------- DND RELATED -----------------

	const [hoveredGap, setHoveredGap] = React.useState<number|undefined>(undefined);

	// Helpers to get the get the gap index from the item index
	const prevGap = (itemIndex: number) => itemIndex;
	const nextGap = (itemIndex: number) => itemIndex + 1;

	const onBucketItemHover = (hoverId: string, dragId: string, isPastHalf: boolean) => {
		if (props.dropDisabled) return;
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
			canDrop: () =>  !props.dropDisabled,
			drop: (dropItem: Item, monitor: DropTargetMonitor<Item, unknown>) => {
				// An item was dropped on the bucket (or a nested drop target).

				log("item drop:", dropItem);

				if (items.length === 0) {
					return addItem(dropItem, hoveredGap);
				}

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
				isHovered: !props.dropDisabled && monitor.isOver(),
			}),
    	}),
		// dependency array - if any of these values change, the above object will be recreated.
		[items, hoveredGap]
	);

	// -----------------RENDER-----------------

	const wrapperClassNames = joinClassNames("bucket-wrapper", isHovered ? "hover" : "");

    return (
        <div ref={dropRef} className={wrapperClassNames} onMouseLeave={()=>(hoveredGap !== undefined) && setHoveredGap(undefined)}>
			<div className={props.displayItemsClass}>
				{
					items.map((I: Item, i: number) => (
						<>
							{i == 0 && <DropGap isActive={hoveredGap===prevGap(i)}/>}
							<DNDItem
								key={i}
								item={I}
								item_type={props.item_type}
								onDelete={!props.deleteDisabled && removeItem}
								onHover={ (dragId, isBelow, isRight) => {
									// What's considered next/prev item depends on orientation
									const isPastHalf = props.isVertical ? isBelow : isRight;
									onBucketItemHover(I.id, dragId, isPastHalf)
								}}
								onLetGo={(dragId: any, bucketId: any) => {
									// Remove the item if it was dropped on a different bucket
									if (!props.deleteOnMoveDisabled && bucketId !== props.id)
										removeItem(dragId);
								}}
								disableReplace={props.replaceDisabled}
							>
								{ props.children[i] }
							</DNDItem>
							<DropGap key={`drop-gap-${i}`} isActive={hoveredGap===nextGap(i)} />
						</>
					))
				}
			</div>
        </div>
    );
};

export default ItemBucket;