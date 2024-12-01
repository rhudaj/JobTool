import React from "react";
import "./texteditdiv.css";
import { TrackVal } from "../../hooks/trackable";

export function TextEditDiv(props: {
    tv: string|TrackVal<string>,
    id?: string,
    className?: string,
}) {

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

    const onBlur = (e: React.FocusEvent) => {
		// assert tv as type TrackVal<string>:
        if (typeof props.tv === "string") return;
        // fires when an element has lost focus
		props.tv.value = e.target.textContent;
	};

    return (
        <div
            className={`text-edit-div ${props.className}`}
            id={props.id}
            contentEditable={true}
            onPaste={onPaste}
            onBlur={onBlur}
        >
            { typeof props.tv === "string" ? props.tv : props.tv.value }
        </div>
    );
}
