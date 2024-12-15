import { useState } from "react";
import { TextEditDiv } from "../TextEditDiv/texteditdiv";
import "./cleditor.scss"
import { TrackVal, wrapTrackable } from "../../hooks/trackable";

export function CLEditor(props: {
    cl_paragraphs: string[],
}) {

    const VAL = useState(wrapTrackable(props.cl_paragraphs))[0];

    return (
        <div id="cl-editor">
            {
                VAL.map((pgraph_tv: TrackVal<string>, i: number)=>(
                    <TextEditDiv key={i} id={`cl-row-${i}`} tv={pgraph_tv}/>
                ))
            }
        </div>
    );
}
