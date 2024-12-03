import { ReactElement, useState } from "react";
import "./splitview.scss"

export function SplitView(props: {
    children: [ReactElement, ReactElement];
}) {
    const[ WRatio, SetWRatio ] = useState(50);

    const onMouseDown = (e: React.MouseEvent) => {
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
            // make sure to re-enable text selection
            document.body.style.userSelect = "auto";
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        // disable text selection while dragging (otherwise it's annoying)
        document.body.style.userSelect = "none";
    }

    // -------------- RENDER --------------

    const L_STYLE = { width: `${WRatio}%` };
    const R_STYLE = { width: `${100 - WRatio}%` };

    return (
        <div className="split-view">
            <div className="view-left" style={L_STYLE}>
                {props.children[0]}
            </div>
            <div className="width-drag" onMouseDown={onMouseDown}>
                ||
            </div>
            <div className="view-right" style={R_STYLE}>
            {props.children[1]}
            </div>
        </div>
    );
};