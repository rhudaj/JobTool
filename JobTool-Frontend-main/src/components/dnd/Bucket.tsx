import { DropTargetMonitor, useDrop } from "react-dnd";
import React, { useEffect, useReducer } from "react";
import { Item, getBucketType } from "./types";
import { DragItem } from "./BucketItem";
import { BucketAction, BucketActions, bucketReducer } from "./useBucket";
import { arrNullOrEmpty } from "../../util";
import { ControlsBox } from "../ControlBox";

// Shows a gap between items when dragging over the bucket.
function DropGap(props: { isActive: boolean }) {
    return (
        <div
            className="border-2 border-solid border-red-500"
            hidden={!props.isActive}
        />
    );
}

// Helpers to get the get the gap index from the item index
const prevGap = (itemIndex: number) => itemIndex;
const nextGap = (itemIndex: number) => itemIndex + 1;

/* -----------------------------------------------------------------------------
                            BUCKET STATE MANAGEMENT
----------------------------------------------------------------------------- */

// Provided to the children of a bucket (<DNDItem>'s)
interface BucketItemContext {
    bucket_id: string;
    item_type: string;
    disableReplace?: boolean;
    disableMove?: boolean;
    dispatch: React.Dispatch<BucketAction>;
    onHover?: (
        hoverId: string,
        dragId: string,
        isBelow: boolean,
        isRight: boolean
    ) => void;
}

// TODO: `just_set` is hacky but neccessary
let just_set = false;

function ItemBucket<T>(props: {
    id?: string;
    items?: Item<T>[];
    onUpdate?: (newVals: any[]) => void;
    onItemUpdate?: (newObj: T, i: number) => void;
    type?: string;
    isHorizontal?: boolean; // orientation of the bucket
    // TODO: put inside 'disable_options' object
    deleteDisabled?: boolean;
    replaceDisabled?: boolean;
    dropDisabled?: boolean;
    deleteOnMoveDisabled?: boolean;
    addItemDisabled?: boolean;
    moveItemDisabled?: boolean;
}) {
    // ----------------- STATE -----------------

    const [bucket, bucketDispatch] = useReducer(bucketReducer, {
        id: "",
        items: [],
    });
    const [hoveredGap, setHoveredGap] = React.useState<number | undefined>(
        undefined
    );
    const bt = getBucketType(props.type); // will return default if !props.type

    // parent -> bucket
    useEffect(() => {
        just_set = true;
        bucketDispatch({
            type: BucketActions.SET,
            payload: {
                id: props.id ?? "",
                items: props.items ?? [],
            },
        });
    }, [props.items, props.id]);

    // bucket -> parent
    useEffect(() => {
        if (just_set) {
            just_set = false;
            return;
        }
        props.onUpdate?.(bucket.items.map((I) => I.value));
    }, [bucket.items]);

    const getIdx = React.useCallback(
        (id: string) => bucket.items.findIndex((I) => I.id === id),
        [bucket.items]
    );

    // ----------------- DND RELATED -----------------



    // Drop functionality
    const [{ isHovered }, dropRef] = useDrop(
        () => ({
            accept: props.type ?? "*",
            canDrop: () => !props.dropDisabled,
            drop: (
                dropItem: Item<T>,
                monitor: DropTargetMonitor<Item<T>, unknown>
            ) => {
                console.info(
                    `Item ${dropItem.id} dropped on bucket ${bucket.id}`
                );

                // If the bucket is empty, just add the item
                if (arrNullOrEmpty(bucket.items)) {
                    bucketDispatch({
                        type: BucketActions.ADD,
                        payload: { atIndex: 0, item: dropItem },
                    });
                    return;
                }

                // Check if drop was on a nested item
                const nestedDropTarget: any = monitor.getDropResult();

                // Check if item is already in the bucket
                const itemIndex = bucket.items.findIndex(
                    (item) => item.id === dropItem.id
                );
                const notInBucket = itemIndex === -1;

                if (nestedDropTarget?.id !== undefined) {
                    // Nested item got the drop
                    bucketDispatch({
                        type: BucketActions.CHANGE,
                        payload: {
                            id: nestedDropTarget.id,
                            newValue: dropItem.value,
                        },
                    });
                } else if (notInBucket) {
                    // Not in the bucket yet, so add it
                    bucketDispatch({
                        type: BucketActions.ADD,
                        payload: { atIndex: hoveredGap, item: dropItem },
                    });
                } else if (!props.moveItemDisabled) {
                    // Its in the bucket already. Re-order.
                    let newIndex = Math.max(
                        0,
                        Math.min(hoveredGap ?? 0, bucket.items.length - 1)
                    );
                    bucketDispatch({
                        type: BucketActions.MOVE,
                        payload: {
                            indexBefore: itemIndex,
                            indexAfter: newIndex,
                        },
                    });
                }

                // After drop, no need to display the gap
                if (hoveredGap !== undefined) setHoveredGap(undefined);

                // Return bucket ID as drop result
                return { id: bucket.id };
            },
            collect: (monitor) => ({
                isHovered: !props.dropDisabled && monitor.isOver(),
            }),
        }),
        [bucket?.items, hoveredGap]
    );

    // Hover handler
    const onItemHover = React.useCallback(
        (
            hoverId: string,
            dragId: string,
            isBelow: boolean,
            isRight: boolean
        ) => {
            // Whether it's "past half" depends on bucket orientation
            const isPastHalf = props.isHorizontal ? isRight : isBelow;

            // Find the index of the item being hovered over
            const hoveredIndex = getIdx(hoverId);
            const dragIndex = getIdx(dragId);

            // Find the corresponding gap
            let gapIndex = isPastHalf
                ? nextGap(hoveredIndex)
                : prevGap(hoveredIndex);

            const diff = dragIndex - gapIndex;

            // Is the gap around the current drag item?
            if (diff === 0 || diff === -1) {
                gapIndex = undefined;
            }

            setHoveredGap(gapIndex);
        },
        [getIdx, props.isHorizontal]
    );

    // Render controls for each item
    const renderControls = React.useCallback((item_id: Item<T>) => {
        const controls = [
            {
                id: "move",
                icon_class: "fa-solid fa-grip",
                disabled: props.moveItemDisabled,
            },
            {
                id: "delete",
                disabled: props.deleteDisabled,
                icon_class: "fa-solid fa-x",
                onClick: () =>
                    bucketDispatch({
                        type: BucketActions.REMOVE,
                        payload: { id: item_id},
                    }),
            },
            {
                id: "add-above",
                icon_class: "fa-solid fa-arrow-up",
                disabled: props.addItemDisabled,
                onClick: () =>
                    bucketDispatch({
                        type: BucketActions.ADD_BLANK,
                        payload: { id: item_id, below: false },
                    }),
            },
            {
                id: "add-below",
                icon_class: "fa-solid fa-arrow-down",
                disabled: props.addItemDisabled,
                onClick: () =>
                    bucketDispatch({
                        type: BucketActions.ADD_BLANK,
                        payload: { id: item_id, below: true },
                    }),
            },
        ]

        return <ControlsBox placement="top" controls={controls} />;

    }, [ props.moveItemDisabled, props.deleteDisabled, props.addItemDisabled ]);

    // -----------------RENDER-----------------

    return (
        <div
            ref={dropRef as any}
            title="bucket-dnd-wrapper"
            className={isHovered ? "border-dashed border-black" : ""}
            onMouseLeave={() => setHoveredGap(undefined)}
        >
            <div
                title="bucket-items"
                className={bt?.layoutClass}
                style={bt?.style}
            >
                {bucket.items?.map((item, index) => (
                    <div key={`bucket-${bucket.id}-item-${index}`}>
                        <DropGap isActive={ index === 0 && hoveredGap === prevGap(index) } />
                        <DragItem
                            item={item}
                            dragProps={{
                                type: props.type,
                                canDrag: !props.moveItemDisabled,
                            }}
                            onHover={onItemHover}
                        >
                            {renderControls(item)}
                            <bt.DisplayItem
                                obj={item.value}
                                onUpdate={(newObj: T) =>
                                    props.onItemUpdate?.(newObj, index)
                                }
                            />
                        </DragItem>
                        <DropGap isActive={hoveredGap === nextGap(index)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export const BucketItemContext = React.createContext<BucketItemContext>(null);
export default ItemBucket;
