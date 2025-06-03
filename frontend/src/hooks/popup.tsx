import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useState, ReactNode, useRef, useMemo, Ref } from "react";

export function PopupUI(props: {
    onClose: () => void
    children: ReactNode
    title?: string
}) {
    return (
        <Dialog
            open={true}
            onClose={props.onClose}
            style={{ position: 'relative', zIndex: 50 }}
        >
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <DialogBackdrop style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)"}} />

            {/* Full-screen container to center the panel */}
            <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

                {/* The actual dialog panel  */}
                <DialogPanel style={{ padding: '2em', backgroundColor: 'white', border: '1rem solid' }}>
                    <DialogTitle style={{ fontWeight: 'bold' }}>{props.title}</DialogTitle>
                    {props.children}
                </DialogPanel>
            </div>
        </Dialog>
    );
}

let i = 0;
interface PopupParams {
    title?: string
    content?: ReactNode
};
export const usePopup = (title?: string, content?: ReactNode) => {

    const [component, setComponent] = useState<ReactNode>(null);
    const contentRef = useRef(content);

    const open = (content?: ReactNode | any) => {
        // If they passed a valid react component, use that instead
        content = (content && !content.$$typeof) ? contentRef.current : content;
        console.log(`opening '${title}' popup`);
        setComponent(
            <PopupUI key={++i} title={title} onClose={close}>{content}</PopupUI>
        );
    };

    const close = () => {
        console.log(`closing '${title}' popup`);
        setComponent(null);
    };

    const getTriggerButton = (
        p?: PopupParams,
        ...otherParams: any
    ) => (
        <>
            {component}
            <button key={++i}{...otherParams} onClick={()=>open(p.content)}>{p.title || title}</button>
        </>
    )

    return {
        title,
        open,
        close,
        component,
        getTriggerButton
    };
};
