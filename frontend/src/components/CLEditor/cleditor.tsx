import React, { useEffect } from "react";
import { TextEditDiv } from "../TextEditDiv/texteditdiv";
import "./cleditor.scss"
import { BucketComponent } from "../dnd/dnd";

export function CLEditor(props: {
    paragraphs: string[],
}) {

    const [pgs, setPgs] = React.useState<string[]>(props.paragraphs);

    useEffect(()=> setPgs(props.paragraphs), [props.paragraphs]);

    return (
        <BucketComponent
            id="cl-paragraphs"
            values={pgs}
            isVertical={true}
            displayItemsClass="cl-editor"
            item_type="cl-paragraph"
        >
            {
                pgs?.map((p: string, i: number)=>(
                    <TextEditDiv key={i} id={`cl-row-${i}`} tv={p}/>
                ))
            }
        </BucketComponent>
    );
}
