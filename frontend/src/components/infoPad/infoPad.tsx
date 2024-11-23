import './infoPad.css';
import { useEffect, useState } from "react";
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * Item objects and types
 * DnD state via flux
 * Monitors for observing DnD state
 * Collector functions for turning monitor output into consumable props
 * Connectors for attaching the DnD state machine to view nodes (e.g. DOM elements)
 *
 * React-DnD provides hooks that connect your components to the DnD engine, and allow you to collect monitor state for rendering.
 */

function TextDrag(props: {text: string}) {
    const [{ isDragging }, dragRef ] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: 'TEXT',
        // pass the data we will need later for the drop area. We only need the necessary data to render the representation of the item in the drop area
        item: props,
        // The collect function (optional) utilizes a "monitor" instance to pull important pieces of state from the DnD system.
        collect: (monitor) => ({
            // 'monitor' holds the state and metadata of the drag action.
            isDragging: monitor.isDragging()
        })
    }));

    return (
        <div ref={dragRef}>
            {props.text}
        </div>
    );
};

function Bucket() {
    const [bucket, setBucket] = useState([]);

    // to tell react-dnd that an element is a drop area, we need to supply it with a ref property (dropRef)
    const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
        // The type (or types) to accept - strings or symbols
        accept: 'TEXT',
        // The drop() method is called when a compatible item is dropped on the drop target
        //  receives the data we passed in the item property for useDrag.
        drop: (item, monitor) => {
            setBucket((bucket) =>
                !bucket.includes(item) ? [...bucket, item] : bucket)
        },
        // Props to collect
        collect: (monitor) => ({
            isOver: monitor.isOver(),   // boolean: is dragged item currently above (over) our drop area
            canDrop: monitor.canDrop()
        })
    }))

    return (
        <div
            ref={dropRef}
            style={{ backgroundColor: isOver ? 'red' : 'white' }}
        >
            {
                bucket.map((item, index) => (
                    <div key={index}>
                        {item.text}
                    </div>
                ))
            }
            {canDrop ? 'Release to drop' : 'Drag a box here'}
        </div>
    )
  }

export function InfoPad(props: { cv_info: any} ) {

    const [cv_info, set_cv_info] = useState<{gid: any, items: any[]}[]>([]);

    useEffect(() => {
        console.log("CV info:", props.cv_info);
        const arr = Object.entries(props.cv_info).map(entry => ({
            gid: entry[0] as string,
            items: entry[1] as any[]
        }));
        console.log("CV info as array:", arr);
        set_cv_info(arr);
    }, [props]);


    return (
        <div id="info-pad">
            {
                cv_info.map((group) => (
                    <div key={group.gid}>
                        <h3>{group.gid}</h3>
                        <div>
                            {
                                group.items.map((item, index) => (
                                    <TextDrag key={index} text={item}></TextDrag>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
            <Bucket />
        </div>
    );
};