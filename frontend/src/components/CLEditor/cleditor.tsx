import { TextEditDiv } from "../TextEditDiv/texteditdiv";
import "./cleditor.css"

export function CLEditor(props: {
    cl_paragraphs: string[],
}) {
    return (
        <div id="cl-editor">
            {
                props.cl_paragraphs.map((P, P_num)=>(
                    <TextEditDiv id={`cl-row-${P_num}`} text={P}/>
                ))
            }
        </div>
    );
}
