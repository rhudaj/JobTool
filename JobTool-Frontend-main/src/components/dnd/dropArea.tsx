import { useState, useEffect } from "react";
import { allBucketTypeNames, getBucketType, Item } from "./types";
import { useDrop } from "react-dnd";
import { StandaloneDragItem } from "./BucketItem";

export function SingleItemDropArea<T>(props: {
    id: string,
    onUpdate: (state: Item<T> & { type: string }) => void,
}){

    const [state, setState] = useState<Item<T> & { type: string }>(null);

    useEffect(()=>{
        if(!state || !state.value || !state.id) return;
        props.onUpdate(state);
    }, [state]);

    const [{ isHovered }, dropRef] = useDrop(() => ({
        accept: allBucketTypeNames,
        drop: (dropItem: Item<T> & { type: string }) => {
            console.log('Item dropped:', dropItem);
            setState(dropItem)
        },
        collect: (monitor) => ({
            isHovered: monitor.isOver(),
        }),
    }), []);


    // ----------------- VIEW -----------------

    return (
        <div
            title="drop-area"
            ref={dropRef as any}
            className={isHovered ? "border-dashed border-black" : ""}
        >
            <div
                title="bucket-items"
                className="min-h-10 border-1 border-dashed p-2"
            >
                { state &&
                <StandaloneDragItem item={state} item_type={state.type}>
                    { getBucketType(state.type).DisplayItem({obj: state.value }) }
                </StandaloneDragItem>}
            </div>
        </div>
    );
};