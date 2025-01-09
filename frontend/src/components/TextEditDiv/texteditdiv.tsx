import React from "react";
import "./texteditdiv.scss";
import { TrackVal } from "../../hooks/trackable";
import { joinClassNames } from "../../hooks/joinClassNames";

export function TextEditDiv(props: {
    tv: string|TrackVal<string>,
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

    const onPaste = (e: React.ClipboardEvent) => {
        // prevent default paste behavior (which copies styles)
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

    const onBlur = (e: React.FocusEvent) => {
        setIsEditing(false);
		// assert tv as type TrackVal<string>:
        if (typeof props.tv === "string") {
            if (props.onUpdate) props.onUpdate(e.target.textContent)
        } else {
            // fires when an element has lost focus
		    props.tv.value = e.target.textContent;
        }
	};

    // ----------------- RENDER -----------------

    const classNames = joinClassNames("text-edit-div", props.className, isEditing ? "editing" : "");

    return (
        <div
            className={classNames}
            id={props.id}
            contentEditable={isEditing}
            onPaste={onPaste}
            onBlur={onBlur}
            onDoubleClick={()=>setIsEditing(true)}
        >
            { props.tv }
            {/* { typeof props.tv === "string" ? props.tv : props.tv.value } */}
        </div>
    );
}
