import { useDrag, useDrop } from "react-dnd";
import "./dnd.scss";
import React from "react";
import { useLogger } from "../../hooks/logger";
import { DeleteButton } from "./controls/delete";
import { joinClassNames } from "../../hooks/joinClassNames";
import { Item, DEFAULT_ITEM_TYPE } from "./types";

// TODO: should be usable on its own (ie: has its own state) in the case you dont want a bucket.
function DNDItem(props: {
    item: Item,
    children: JSX.Element,
    item_type?: string,
    onHover?: (dragId: string, isBelow: boolean, isRight: boolean) => void,
    onLetGo?: (dragId: any, bucketId: any) => void, // send to parent when you drop on a bucket
    onDelete?: (id: any) => void,
} & {
    // Optional props
    disableDrag?: boolean		// defaults to false
    disableReplace?: boolean 	// defaults to false
}) {


    const log = useLogger("DNDItem");

    // -------------------- STATE ---------------------

    const ref = React.useRef(null);

    // -----------------DRAG FUNCTIONALITY-----------------

    const [{isDragging}, drag] = useDrag(() => ({
        type: props.item_type ?? DEFAULT_ITEM_TYPE,
        canDrag: props.disableDrag !== true,
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
                return props.disableReplace !== true && dropItem.id !== props.item.id;
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
        props.disableDrag === true ? "no-drag" : "can-drag"
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

export default DNDItem;