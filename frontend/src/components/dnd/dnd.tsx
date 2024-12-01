import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import "./dnd.css";
import React from "react";


// monitor.didDrop() only tells you if there was a nested object under. Not wether/not they returned anything from didDrop(). So its kind of useless.

/** Unnecessary React.useEffect to Sync buckets
 * a useEffect re-initializing state every time props change might cause unintended side effects.
 * This reinitialization isn't needed if you want the state to evolve independently of the initial buckets prop.
 * */


// TODO: somehow decouple the hover logic from the dragSourceComponent

/** you don't need a bucket manager. Buckets should all be independet ...
 * They don't need a centralized manager. They can manage themselves.
 * Need to modify 'Item' to carry the necessary information to the target.
 * A bucket should manage when its own item leaves (by monitoring the drop result).
 * A bucket shouldn't care about where a dragItem is coming from. It knows itself what it can accept.
 * BUT it does need to send out some msg indicating what it did.
 *
 *
 * PROBLEM: your not supposed to pass around complex objects in the dragItem (ie: components).
 * So need a central reference somewhere
 * */

// The actual Data:

interface Item {
	id: any;
	value: any;		// can't be a JSX element. Anything else is fine.
};

interface Bucket {
	id: any;
	items: Item[];
};

function DragSourceComponent(props: {
	item: Item,
	displayItem: (props: {item: Item}) => JSX.Element,
	// OPTIONAL PROPS
	onHover?: (dragId: string, isBelow: boolean, isRight: boolean) => void,
	onLetGo?: (dragId: any, bucketId: any) => void, // send to parent when you drop on a bucket
	canBeTarget?: boolean // defaults to true
}) {

	const log = (...args: any) => console.log(`DragSource ${props.item.id}:\n\t`, ...args);

	const ref = React.useRef(null);

    const [collectedProps, drag, dragPreview] = useDrag(
		() => ({
			type: "DRAG-ITEM",
			item: () => {
				log("Started to drag.");
				return props.item; 			// sent to the drop target when dropped.
			},
			end: (item: Item, monitor) => {
				const dropResult: {id: any} = monitor.getDropResult();
				props.onLetGo(item.id, dropResult.id);
				log("Drop result:", dropResult);
			},
			collect: (monitor) => ({
				// INJECT PROPS into the component.
				isDragging: monitor.isDragging()
			}),
		}),
		[props.item, props.onHover]
	);

	// Works as a Drop Target as well
	const [{isDropTarget}, dropRef] = useDrop(
		() => ({
			accept: "DRAG-ITEM",
			canDrop: (dropItem: Item) => {
				return (props.canBeTarget != false) && dropItem.id !== props.item.id;
			},
			drop: (dragItem: Item, monitor) => {
				// sent to the drag source & parent bucket that was dropped on.
				return props.item;
			},
			hover: (dragItem: Item, monitor) => {
				// Report back to parent where the dragItem is relevant to this component:

				if ( !props.onHover || dragItem.id === props.item.id )
					// We're not meant to care, and don't replace items with themselves
					return;

				const rect = ref.current.getBoundingClientRect();
				const dragPos = monitor.getClientOffset();

				props.onHover(
					dragItem.id,
					(dragPos.y - rect.top) > (rect.bottom - rect.top)/2, 	// is it below?
					(dragPos.x - rect.left) > (rect.right - rect.left)/2	// is it right?
				);
			},
			collect: (monitor) => ({
				isDropTarget: monitor.canDrop() && monitor.isOver(),
			}),
		}),
		[props.item, props.onHover]
	);

	drag(dropRef(ref));

	// Render the drag-preview & the original div.
	return (
		<div
			ref={dragPreview}
			className={`box-drag-preview ${collectedProps.isDragging ? "drag" : ""}`}
		>
			<div role="Handle" ref={ref} className={`drag-item ${isDropTarget ? "droppable" : ""}`}>
				{ props.displayItem({item: props.item}) }
			</div>
		</div>
	);
};

/**
 * Defines a Bucket as a state object.
 * Essentially a wrapper for Item[].
 * Keeps track of state internally, and provides provides methods to add, remove, reorder, etc.
 */
const useBucket = (bucket: Bucket) => {

	const [items, setItems] = React.useState<Item[]>(bucket.items);

	// -----------------HELPERS-----------------

	const getIdx = (id: any): number => {
		return items.findIndex((item) => item.id === id);
	};

	const log = (...args: any) => console.log(`Bucket ${bucket.id}:\n\t`, ...args);

	// -----------------STATE MODIFIERS-----------------

	/**
	 * Call assumes item is not already in the bucket.
	 */
	const addItem = (item: Item, atIndex?: number) => {
		log("Adding item:", item);
		setItems(prev => {
			const copy = structuredClone(prev);
			if (atIndex) 	copy.splice(atIndex, 0, item);
			else 			copy.push(item);
			return copy
		})
	};

	const moveItem = (indexBefore: number, indexAfter: number) => {
		log(`Moving item from ${indexBefore} to ${indexAfter}`);
		setItems(prev => {
			const copy = structuredClone(prev);
			const [movedItem] = copy.splice(indexBefore, 1);
			copy.splice(indexAfter, 0, movedItem);
			return copy;
		});
	};

	const removeItem = (id: any) => {
		log("Removing item:", id);
		setItems(prev => {
			const copy = structuredClone(prev);
			copy.splice(getIdx(id), 1);
			return copy;
		});
	};

	const changeItemValue = (id: any, newValue: any) => {
		log("Changing item value:", id);
		setItems(prev => {
			const copy = structuredClone(prev);
			copy[getIdx(id)].value = newValue;
			return copy;
		});
	};

	return { items, addItem, moveItem, removeItem, changeItemValue };
};

function BucketComponent(props: {
	bucket: Bucket,
	isVertical?: boolean,
	displayItem: (props: {item: Item}) => JSX.Element,
}) {

	// -----------------STATE-----------------

	const { items, addItem, moveItem, removeItem, changeItemValue } = useBucket(props.bucket);

	/** hoveredGap (state)
	 * A number indicating which gap is highlighted when dragging over the bucket.
	 * undefined if no current hover, otherwise
	 * A number between 0 and (props.items.length + 1) */
	const [hoveredGap, setHoveredGap] = React.useState<number|undefined>(undefined);

	// -----------------DND RELATED-----------------

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
			accept: "DRAG-ITEM",
			canDrop: (item: Item) => {
				return true;
			},
			drop: (dropItem: Item, monitor: DropTargetMonitor<Item, unknown>) => {
				// Called when an item is dropped on the component (including nested items)

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
				return { id: props.bucket.id };
			},
			collect: (monitor) => ({
				isHovered: monitor.isOver()
			}),
    	}),
		// dependency array - if any of these values change, the above object will be recreated.
		[items, hoveredGap]
	);

	// -----------------RENDER-----------------

	function DropGap(props: {isActive: boolean}) {
		return <div className="drop-gap" hidden={!props.isActive}/>
	};

    return (
        <div
			ref={dropRef}
			className={`bucket ${isHovered ? "hover" : ""}`}
			style={{flexDirection: props.isVertical ? "column" : "row"}}
		>
            {
				items?.map((I: Item, i: number) => (
					<div
						key={i}
						className="bucket-item-container"
						style={{flexDirection: props.isVertical ? "column" : "row"}}
					>
						<DropGap isActive={hoveredGap===prevGap(i)}/>
						<DragSourceComponent
							key={i}
							item={I}
							displayItem={props.displayItem}
							canBeTarget={true}
							onHover={ (dragId, isBelow, isRight) => {
								// What's considered next/prev item depends on orientation
								const isPastHalf = props.isVertical ? isBelow : isRight;
								onBucketItemHover(I.id, dragId, isPastHalf)
							}}
							onLetGo={(dragId: any, bucketId: any) => {
								// Remove the item if it was dropped on a different bucket
								if (bucketId !== props.bucket.id)
									removeItem(dragId);
							}}
						/>
						<DropGap isActive={hoveredGap===nextGap(i)}/>
					</div>
				))
			}
        </div>
    );
};

export { Item, Bucket, DragSourceComponent, BucketComponent}