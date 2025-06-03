import { useEffect, useRef, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css"; // icons
import { joinClassNames } from "@/lib/utils";

export interface IconControl {
    id?: string;
    icon_class?: string;
    title?: string;
    disabled?: boolean;
    [key: string]: any; // Allows any additional props (handlers, styles, etc.)
}

export function ControlsBox(props: {
    id?: string;
    placement: "top" | "bottom" | "left" | "right";
    buttonClass?: string;
    controls: IconControl[];
    isVertical?: boolean;
}) {
    const styles: React.CSSProperties = {
        flexDirection: props.isVertical ? "column" : "row",
    }

    // if(props.placement === "left") styles.right = "100%"
    // else if (props.placement === "top") styles.left = 0

    // Position the control box based on placement
    if (props.placement === "left") {
        styles.right = "100%";
        styles.top = 0;
    } else if (props.placement === "top") {
        styles.left = 0;
        styles.bottom = "100%"; // Position above the parent
    } else if (props.placement === "right") {
        styles.left = "100%";
        styles.top = 0;
    } else if (props.placement === "bottom") {
        styles.left = 0;
        styles.top = "100%";
    }

    return (
        <div
            title="controls-box"
            id={props.id}
            className="absolute flex gap-[10%]"
            style={styles}
        >
            {props.controls.map(
                ({ id, icon_class, title, disabled, ...handlers }) =>
                    disabled ? null : (
                        <i
                            title={`control-button-${title}`}
                            key={id}
                            id={id}
                            className={
                                joinClassNames(
                                    icon_class,
                                    props.buttonClass,
                                    "text-gray-500 p-0.3 cursor-pointer hover:text-black transform hover:scale-110 transition-all duration-300"
                                )
                            }
                            {...handlers}
                        />
                    )
            )}
        </div>
    );
}

/**
 * Optional hook to hug alongside the ControlsBox
 */
export function useHoverBuffer(buffer: number) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [nestedHovered, setNestedHovered] = useState(false);

    // Handlers:

    const handleMouseMove = (event: MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const insideParent =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
        const nearParent =
            event.clientX >= rect.left - buffer &&
            event.clientX <= rect.right + buffer &&
            event.clientY >= rect.top - buffer &&
            event.clientY <= rect.bottom + buffer;
        setIsHovered(insideParent || nearParent);
    };

    const handleMouseEnter = () => {
        if (!ref.current) return;
        setNestedHovered(false); // reset
        ref.current.dispatchEvent(
            new CustomEvent("nested-hover", { bubbles: true })
        ); // Dispatch nested-hover when mouse enters
    };

    const handleNestedHover = (event: Event) => {
        // Don't show controls when nested-hover event reaches this component
        if (!ref.current || event.target === ref.current) return;
        setNestedHovered(true);
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [buffer]);

    useEffect(() => {
        ref.current?.addEventListener("mouseenter", handleMouseEnter);
        ref.current?.addEventListener("nested-hover", handleNestedHover);
        return () => {
            ref.current?.removeEventListener("mouseenter", handleMouseEnter);
            ref.current?.removeEventListener("nested-hover", handleNestedHover);
        };
    }, []);

    return { ref: ref, isHovered: isHovered && !nestedHovered };
}
