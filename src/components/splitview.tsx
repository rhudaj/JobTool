import { ReactElement, useRef, useState } from "react";

export function SplitView(props: {
    children: [ReactElement, ReactElement]
}) {
    const bounds_ref = useRef(null);
    const[ WRatio, SetWRatio ] = useState(50);
    const [ hidden, setHidden ] = useState([false, false])

    const onMouseDown = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startWRatio = WRatio;

        const bounds = bounds_ref.current.getBoundingClientRect();

        const onMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;

            SetWRatio(Math.min(
                99,
                Math.max(1, startWRatio + (deltaX / window.innerWidth) * 100)
            ));

            if( e.clientX >= bounds.right ) {
                setHidden([false, true])
            } else if ( e.clientX <= bounds.left ) {
                setHidden([true, false])
            } else if(hidden[0] || hidden[1]) {
                setHidden([false, false])
            }
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

    const view_style = "max-h-[100vh] overflow-y-scroll";
    const L_STYLE = { width: `${WRatio}%` };
    const R_STYLE = { width: `${100 - WRatio}%` };

    return (
        <div id="split-view" ref={bounds_ref} className="flex flex-row">
            {!hidden[0] &&
                <div id="lhs-view" className={view_style} style={L_STYLE}>
                    {props.children[0]}
                </div>
            }
            <div id="width-drag" onMouseDown={onMouseDown} className="w-3.5 text-center bg-gray-600 cursor-col-resize">
                ||
            </div>
            {!hidden[1] &&
                <div id="rhs-view" className={view_style} style={R_STYLE}>
                    {props.children[1]}
                </div>
            }
        </div>
    );
};