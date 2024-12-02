import React from "react";
import "./A4-page.scss"

export function PrintablePage(props: {
    children: React.ReactElement,
    page_id: string,
}) {
    if (!props.children) return null;
    return (
        <div className="page-container">
            <div className="A4-page" id={props.page_id}>
                { props.children }
            </div>
        </div>
    );
};