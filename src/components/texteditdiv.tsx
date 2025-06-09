import React, { useRef } from "react";
import { joinClassNames } from "@/lib/utils";

/**
 * @param tv standard text || html string
 * @note any style update (bold, italics, underline supported to the browser will update the string value).
 */
function TextEditDiv(props: {
    tv: string,
    id?: string,
    className?: string,
    onUpdate?: (newVal: string) => void
}) {

    // ----------------- STATE -----------------

    /**
     * Whether the div is currently being edited.
     * Enabled <= onDoubleClick
     * Disabled <= onBlur */
    const [isEditing, setIsEditing] = React.useState(false);
    // Reference to the div element to prevent dangerouslySetInnerHTML from overriding user edits
    const divRef = useRef<HTMLDivElement>(null);

    // prevent default paste behavior (which copies styles)
    const onPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        // 1 - Get text representation of clipboard:
        const txt = e.clipboardData.getData("text/plain");
        // 2- insert text manually:
            // get selection and delete it:
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;
            selection.deleteFromDocument();
            // insert text at selection point (cursor):
            selection.getRangeAt(0).insertNode(document.createTextNode(txt));
    };

    // When done editing
    const onBlur = (e: React.FocusEvent) => {
        setIsEditing(false);
        const html_str = (e.target as HTMLElement).innerHTML;
        // Only update if content actually changed to avoid unnecessary state updates
        if (props.onUpdate && html_str !== props.tv) {
            console.log("Updated TextEditDiv!")
            props.onUpdate(html_str);
        }
	};

    // ----------------- RENDER -----------------

    const classNames = joinClassNames(
        props.className,
        isEditing ? "outline-none" : "hover:outline-dashed hover:outline-blue min-w-5"
    );

    // Only set dangerouslySetInnerHTML when not editing and on first render
    // This prevents React from overwriting the user's edits during re-renders
    React.useEffect(() => {
        if (!isEditing && divRef.current) {
            divRef.current.innerHTML = props.tv;
        }
    }, [props.tv, isEditing]);

    return (
        <div
            ref={divRef}
            title="text-edit-div"
            className={classNames}
            id={props.id}
            contentEditable={isEditing}
            onPaste={onPaste}
            onBlur={onBlur}
            onDoubleClick={()=>setIsEditing(true)}
        />
    );
}

export default TextEditDiv;