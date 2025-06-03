import * as Dialog from "@radix-ui/react-dialog";
import { useState, ReactNode, useRef, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Context for popup management
const PopupContext = createContext<{
    popups: Set<string>;
    addPopup: (id: string) => void;
    removePopup: (id: string) => void;
}>({
    popups: new Set(),
    addPopup: () => {},
    removePopup: () => {},
});

// Provider component to manage multiple popups
export function PopupProvider({ children }: { children: ReactNode }) {
    const [popups, setPopups] = useState<Set<string>>(new Set());

    const addPopup = (id: string) => {
        setPopups(prev => new Set([...prev, id]));
    };

    const removePopup = (id: string) => {
        setPopups(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    return (
        <PopupContext.Provider value={{ popups, addPopup, removePopup }}>
            {children}
        </PopupContext.Provider>
    );
}

// Improved popup UI component using Radix UI and Tailwind
export function PopupUI({
    open,
    onClose,
    title,
    children,
    size = "default",
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: "sm" | "default" | "lg" | "xl" | "full";
}) {
    const sizeClasses = {
        sm: "max-w-md",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw]"
    };

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={cn(
                        "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                        sizeClasses[size]
                    )}
                >
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        {title && (
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                                {title}
                            </Dialog.Title>
                        )}
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        {children}
                    </div>
                    <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// Enhanced popup hook with better API
interface PopupOptions {
    size?: "sm" | "default" | "lg" | "xl" | "full";
}

export function usePopup(title?: string, defaultContent?: ReactNode, options: PopupOptions = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState<ReactNode>(defaultContent);
    const contentRef = useRef(defaultContent);

    const open = (content?: ReactNode) => {
        if (content !== undefined) {
            setCurrentContent(content);
        } else {
            setCurrentContent(contentRef.current);
        }
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
    };

    const updateContent = (content: ReactNode) => {
        contentRef.current = content;
        if (isOpen) {
            setCurrentContent(content);
        }
    };

    // Auto-rendering popup component
    const PopupComponent = () => (
        <PopupUI
            open={isOpen}
            onClose={close}
            title={title}
            size={options.size}
        >
            {currentContent}
        </PopupUI>
    );

    // Simple trigger button helper
    const createTriggerButton = (
        buttonText?: string,
        content?: ReactNode,
        buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
    ) => (
        <button
            {...buttonProps}
            onClick={() => open(content)}
            className={cn(
                "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                buttonProps?.className
            )}
        >
            {buttonText || title || "Open"}
        </button>
    );

    return {
        isOpen,
        open,
        close,
        updateContent,
        PopupComponent,
        createTriggerButton,
        // Legacy compatibility
        component: <PopupComponent />,
        title,
        getTriggerButton: (params?: { title?: string; content?: ReactNode }, ...otherParams: any) =>
            createTriggerButton(params?.title, params?.content, otherParams[0])
    };
}
