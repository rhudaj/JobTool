import React from "react";
import { joinClassNames } from "../util/joinClassNames";

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
        const html_str = e.target.innerHTML;
        // use the inner html, in order to copy along styles
        if (props.onUpdate) {
            props.onUpdate(html_str)
        }
	};

    // ----------------- RENDER -----------------

    const classNames = joinClassNames(
        props.className,
        isEditing ? "outline-none" : "hover:outline-dashed hover:outline-blue min-w-5"
    );

    return (
        <div
            title="text-edit-div"
            className={classNames}
            id={props.id}
            contentEditable={isEditing}
            onPaste={onPaste}
            onBlur={onBlur}
            onDoubleClick={()=>setIsEditing(true)}
            dangerouslySetInnerHTML={{__html: props.tv}}
        />
    );
}

export default TextEditDiv;