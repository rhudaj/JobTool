import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "./cleditor.css"

function TextEditDiv(props: {
    text: string,
    id?: string,
}) {
    return(
        <div
            className="text-edit-div"
            id={props.id}
            contentEditable={true}
        >
            {props.text}
        </div>
    );
}

export const CLEditor = forwardRef((
    props: {
        cl_paragraphs: string[],
    },
    ref: React.ForwardedRef<any>
) => {
        const divRef = useRef(null);

        // give the parent 'App' access to localJI
        useImperativeHandle(ref, () => ({
            get() {
                return divRef.current;
            }
        }));
        return (
            <div ref={divRef} id="A4-page-cl">
                <div id="cl-row-grid">
                    {
                        props.cl_paragraphs.map((P, P_num)=>(
                            <TextEditDiv id={`cl-row-${P_num}`} text={P}/>
                        ))
                    }
                </div>
            </div>
        );
    }
);
