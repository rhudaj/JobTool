import React from "react";

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
                className="[container-type:size] bg-white w-full h-auto aspect-[21/29.7]"
            >
                { props.children }
            </div>
        </div>
    );
};