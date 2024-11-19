import React, { useRef, useEffect } from "react";
import "./texteditdiv.css";

export function TextEditDiv(props: {
    text: string,
    id?: string,
    className?: string
}) {

    const onPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        // 1 - Get text representation of clipboard:
        const text = e.clipboardData.getData("text/plain");
        // 2- insert text manually:
            // get selection and delete it:
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;
            selection.deleteFromDocument();
            // insert text at selection point (cursor):
            selection.getRangeAt(0).insertNode(document.createTextNode(text));
    };

    return (
        <div
            className={`text-edit-div ${props.className}`}
            id={props.id}
            contentEditable={true}
            onPaste={onPaste}
        >
            {props.text}
        </div>
    );
}
