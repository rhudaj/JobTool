import "./ItemBucket.scss"
import { DropTargetMonitor, useDrop } from "react-dnd";
import React from "react";
import { useLogger } from "../../hooks/logger";
import { joinClassNames } from "../../hooks/joinClassNames";
import { Item, DEFAULT_ITEM_TYPE } from "./types";
import { useImmer } from "use-immer";
import DNDItem from "./Item";
import objectHash from "object-hash";

/** HELPER COMPONENT
 * Shows a gap between items when dragging over the bucket.
 */
function DropGap(props: {isActive: boolean}) {
	return <div className="drop-gap" hidden={!props.isActive}/>
};

// Helpers to get the get the gap index from the item index
const prevGap = (itemIndex: number) => itemIndex;
const nextGap = (itemIndex: number) => itemIndex + 1;

/**
 * Bucket State Manager
 * @param values - initial values of the bucket
 * items - guaranteed to be defined, but might be empty ([]).
 */
const useBucket = (initItems: Item[]) => {

	const [items, setItems] = useImmer<Item[]>(initItems);

	// -----------------HELPERS-----------------

	const getIdx = (id: any): number => {
		return items.findIndex((item) => item.id === id);
	};

	// -----------------STATE MODIFIERS-----------------

	/**
	 * Call assumes item is not already in the bucket.
	 */
	const addItem = (item: Item, atIndex?: number) => {
		setItems(draft => {
			if (atIndex) 	draft.splice(atIndex, 0, item);
			else 			draft.push(item);
		})
	};

	const moveItem = (indexBefore: number, indexAfter: number) => {
		setItems(draft => {
			const [movedItem] = draft.splice(indexBefore, 1);
			draft.splice(indexAfter, 0, movedItem);
		});
	};

	const removeItem = (id: any) => {
		setItems(draft => {
			draft.splice(getIdx(id), 1);
		});
	};

	const changeItemValue = (id: any, newValue: any) => {
		setItems(draft => {
			draft[getIdx(id)].value = newValue;
		});
	};

	return { items, setItems, addItem, moveItem, removeItem, changeItemValue };
};

/**
 * Bucket of DND Items component
 * @param props
 * @returns
 * TODO: hover and drop only works when over an item, not if there is empty space at the bottom of all items
 * TODO: controls should be put here next to each item (since they only make sense if the item is in a bucker)
 */
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
		!props.values ? [] :
		props.values.map(v => ({
			id: objectHash.sha1(v),
			value: v
		}))
	);
	const [hoveredGap, setHoveredGap] = React.useState<number|undefined>(undefined);

	React.useEffect(() => {
		log("NEW props.values:", props.values);
		setItems(
			!props.values ? [] :
			props.values.map(v => ({
				id: objectHash.sha1(v),
				value: v
			}))
		);
	}, [props.values]);

	// Called whenever INTERNAL state changes:
	React.useEffect(()=>{
		const newValues = items?.map(I=>I.value);
		// Only call the callback if the values have changed
		if (JSON.stringify(newValues) === JSON.stringify(props.values))	// shallow comparison
			return;
		if (props.onUpdate) props.onUpdate(newValues); // && items != bucket.items
	}, [items])

	// ----------------- DND RELATED -----------------

	const onBucketItemHover = (hoverId: string, dragId: string, isPastHalf: boolean) => {
		if (props.dropDisabled) return;

		// Find the index of the item being hovered over:
		const hoveredIndex = items.findIndex((I) => I.id === hoverId);
		let gapIndex = isPastHalf ? nextGap(hoveredIndex) : prevGap(hoveredIndex);
		const dragIndex = items.findIndex((I) => I.id === dragId);
		const diff = dragIndex - gapIndex;

		// Is the gap is around the current dragItem ?
		if (diff == 0 || diff == -1) {
			gapIndex = undefined;
		}

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
					log("Adding item:", dropItem);
					return addItem(dropItem, hoveredGap);
				}

				// drop was ON TOP of a nested item?
				const nestedDropTarget: any = monitor.getDropResult();

				// bucket ALREADY holds it?
				const itemIndex = items.findIndex((item) => item.id === dropItem.id);
				const notInBucket = (itemIndex === -1);

				if( nestedDropTarget?.id !== undefined ) {
					// => nested item handled the drop
					log(`Changing item ${nestedDropTarget.id}'s value:`, dropItem.value);
					changeItemValue(nestedDropTarget.id, dropItem.value);
				} else if (notInBucket) {
					// Not in the bucket yet, so add it.
					log("Adding item:", dropItem);
					addItem(dropItem, hoveredGap);
				} else if (moveItem) {
					// Its in the bucket already, and we've dropped it somewhere else inside
					// that's not over another item. So re-order.
					// CLAMP index between 0 and props.items.length-1
					let newIndex = Math.max(Math.min(hoveredGap, items.length - 1), 0)
					log(`Moving item from ${itemIndex} to ${newIndex}`);
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

	const onAddItemBelow = (id: any) => {
		// TODO: for now just duplicate the item (since we don't know the format)
		const srcIndex = items.findIndex(I => I.id === id)
		console.log("onAddItemBelow. srcIndex = ", srcIndex)
		if (srcIndex !== -1) {
			console.log("adding item below index ", srcIndex);
			const newItem = structuredClone(items[srcIndex]);
			newItem.id += "x"
			addItem(newItem, srcIndex)
		}
	};

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
								onAddItemBelow={onAddItemBelow}
								onHover={ (dragId, isBelow, isRight) => {
									// What's considered next/prev item depends on orientation
									const isPastHalf = props.isVertical ? isBelow : isRight;
									onBucketItemHover(I.id, dragId, isPastHalf)
								}}
								onLetGo={(dragId: any, bucketId: any) => {
									// Remove the item if it was dropped on a different bucket
									if (!props.deleteOnMoveDisabled && bucketId !== props.id) {
										log("Removing item:", dragId);
										removeItem(dragId);
									}
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
