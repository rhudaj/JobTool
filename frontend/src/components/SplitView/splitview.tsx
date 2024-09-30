import { ReactElement, useState } from "react";
import "./splitview.css"

export function SplitView(props: {
    children: [ReactElement, ReactElement];
}) {
    const[ WRatio, SetWRatio ] = useState(50);

    return (
        <div className="split-view">
            <div id="view-left" style={{ width: `${WRatio}%` }}>
                {props.children[0]}
            </div>
            <div
                id="width-drag"
                style={{ cursor: "col-resize", width: "5px", backgroundColor: "gray" }}
                onMouseDown={(e) => {
                    const startX = e.clientX;
                    const startWRatio = WRatio;

                    const onMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const newWRatio = Math.min(90, Math.max(10, startWRatio + (deltaX / window.innerWidth) * 100));
                    SetWRatio(newWRatio);
                    };

                    const onMouseUp = () => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                    };

                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                }}
            >
                *
            </div>
            <div id="view-right" style={{ width: `${100 - WRatio}%` }}>
            {props.children[1]}
            </div>
        </div>
    );
};