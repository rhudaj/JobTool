import { ReactElement } from "react";
import "./splitview.css"

export function SplitView(props: {
    children: [ReactElement, ReactElement];
}) {
    return (
        <div className="split-view">
            <div id="view-left" style={{width: "50%"}}>
                {props.children[0]}
            </div>
            <div id="view-right" style={{width: "50%"}}>
                {props.children[1]}
            </div>
        </div>
    );
};