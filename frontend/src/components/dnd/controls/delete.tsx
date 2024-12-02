import './delete.css';
import React from "react";

/**
 * A button that will hover over some reference element and
 * notify the parent to delete it when clicked.
 */
const DeleteButton = React.forwardRef<HTMLElement, any>((
	props: { onDelete: ()=>void },
	ref: React.RefObject<HTMLElement>
) => {

	const [isHovered, setIsHovered] = React.useState(false);
	const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

	const pad = 10;

	React.useEffect(() => {
		if (ref.current) {
			const rect = ref.current.getBoundingClientRect();
			setPosition({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX,
			});
		}
	}, [ref]); // Recalculate position when `ref` or `isActive` changes.

	React.useEffect(() => {
		const element = ref.current;

		if (!element) return;

		const handleMouseEnter = () => {
			const rect = element.getBoundingClientRect();
			setPosition({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX,
			});
			setIsHovered(true);
			document.addEventListener("mousemove", handleMouseMove);
		};

		const handleMouseMove = (event: MouseEvent) => {
			const rect = element.getBoundingClientRect();
			const withinRange = (
				event.clientX >= rect.left - pad &&
				event.clientX <= rect.right + pad &&
				event.clientY >= rect.top - pad &&
				event.clientY <= rect.bottom + pad
			);
			if (!withinRange) {
				setIsHovered(false);
				document.removeEventListener('mousemove', handleMouseMove);
			}
		};

		element.addEventListener('mouseenter', handleMouseEnter);

		// Cleanup event listeners on unmount
		return () => {
			element.removeEventListener('mouseenter', handleMouseEnter);
		};
	}, [ref]);

	React.useEffect(() => {
		console.log(isHovered);
	}, [isHovered]);

	if (!isHovered) return null; // Hide the button when not hovered.
	return (
		<div
			className="delete-button"
			onClick={props.onDelete}
			style={{
				position: "absolute",
				top: position.top - pad,
				left: position.left - pad,
				display: 'block',
				cursor: 'pointer',
			}}
		>
			X
		</div>
	);
});

export { DeleteButton };