import React from "react";
import "./texteditdiv.css";

export class TrackVal<T> extends String {
    private _value: T;
    private listeners: Set<(newValue: T) => void> = new Set();

    constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    // Getter for the current value
    get value(): T {
      return this._value;
    }

    // Setter to update the value and notify listeners
    set value(newValue: T) {
      console.log(`TrackVal: new value <= ${newValue}`)
      if (newValue !== this._value) {
        this._value = newValue;
        this.listeners.forEach((callback) => callback(newValue));
      }
    }
};

// const wrapTrackable = (obj: any): any => {
//     if (typeof obj === "object" && obj !== null) {
//       return Object.fromEntries(
//         Object.entries(obj).map(([key, value]) => [key, wrapTrackable(value)])
//       );
//     } else {
//       return new TrackVal(obj);
//     }
// };

// const unwrapTrackable = (obj: any): any => {
//     if (obj instanceof TrackVal) {
//       return obj.value;
//     } else if (typeof obj === "object" && obj !== null) {
//       return Object.fromEntries(
//         Object.entries(obj).map(([key, value]) => [key, unwrapTrackable(value)])
//       );
//     } else {
//       return obj;
//     }
// };

export function TextEditDiv(props: {
    text: TrackVal<any> | string,
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
		// fires when an element has lost focus
		if (typeof props.text === "string") return;
		props.text.value = e.target.textContent;
	};

    return (
        <div
            className={`text-edit-div ${props.className}`}
            id={props.id}
            contentEditable={true}
            onPaste={onPaste}
            onBlur={onBlur}
        >
            {(typeof props.text === "string") ? props.text : props.text.value}
        </div>
    );
}
