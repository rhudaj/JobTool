import React, { useEffect, useState } from "react";

/**
 * A div (grid) where rows of the grid can be moved around.
 * Arranges children into a grid. Each child is a row in the grid.
 * Each rows can be dragged to change their order.
 * @param props
 */
export function RowDragGrid(props: {
    id: string,
    children: any[]
}) {
    const [rows, setRows] = useState([]);
    useEffect(() => {
        setRows(props.children);
    }, [props.children]);

    const onDrag = (e: React.DragEvent) => {
        console.log("dragging");
        console.log(`Mouse: (${e.clientX},${e.clientY})`)
    }

    const onDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        console.log("drag end");
        // Searach <rows> for <belowElement>. If found, move being dragged before <belowElement>:
        const belowElement = document.elementFromPoint(e.clientX, e.clientY);
        console.log("below element: ", belowElement);
        if (!belowElement) return;
        // Find the row being dragged:
        const dragRow = document.getElementById(e.currentTarget.id);
        console.log('Drag Row: ', dragRow);
        if (!dragRow) return;
        // Find the row below the drag row:
        const belowRow = belowElement.parentElement;
        console.log('Below Row: ', belowRow);
        if (!belowRow) return;
        // Find the index of the drag row:
        const dragRowIndex = Array.from(dragRow.parentElement.children).indexOf(dragRow);
        // Find the index of the below row:
        const belowRowIndex = Array.from(belowRow.parentElement.children).indexOf(belowRow);
        console.log("dragRowIndex: ", dragRowIndex);
        console.log("belowRowIndex: ", belowRowIndex);
        // Move the drag row before the below row (in the rows array):
        const newRows = Array.from(rows);
        newRows.splice(dragRowIndex, 1);
        newRows.splice(belowRowIndex, 0, dragRow);
        setRows(newRows);
    }

    // Add 'onDragEnd' to all of the children in props.children:
    return (
        <div className="row-drag-grid" id={props.id}>
            {
                rows.map(row => (
                    <div
                        id={(row as any).props.id}
                        className="row-drag-grid-row"
                        draggable={true}
                        onDrag={onDrag}
                        onDragEnd={onDragEnd}
                    >
                        {props.children}
                    </div>
                ))
            }
        </div>
    );
}