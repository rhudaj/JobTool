import React from "react";

/**
 * This component is used to wrap a page content that will be printed.
 * It sets the page size to A4 so that when we print the page, it will be in A4 format.
 *
 * Usage:
 * @param children - The content of the page to be printed (e.g. theCVEditor component).
 * @returns
 */
export function PrintablePage(props: {
    children: React.ReactElement,
    page_id: string,
}) {
    if (!props.children) return null;
    return (
        <div title="page-container">
            <div
                title="A4-page"
                id={props.page_id}
                className="[container-type:size] bg-white w-full h-auto aspect-[21/29.7] border border-black"
            >
                { props.children }
            </div>
        </div>
    );
};