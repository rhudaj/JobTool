import React from "react";
import "./A4-page.css"

/**
 *  Print a react component as a pdf
 * @param element_id of the react component you wish to print as pdf
 */
export const printReactComponentAsPdf = (element_id: string) => {
    console.log("Printing component with id: ", element_id);
    // get the react component with id element_id
    const component2print = document.getElementById(element_id);
    if (!component2print) {
        console.error(`Element with id ${element_id} not found`);
        return;
    }

    // Copy all <style> and <link type="stylesheet" /> tags from <head> inside the parent window
    const head_styles: Element[] = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
    console.log("Styles to be copied: ", head_styles);

    // iframe
    const iframe = document.createElement('iframe');
        // hide it from view
        iframe.style.display = 'none';
        // Append it to body of the document to be able to access the content
        document.body.appendChild(iframe);
        // Get the content of the iframe to be able to access the document
        const doc = iframe.contentDocument;
        // Insert styles into the print window <head>
        head_styles.forEach((el: Element) => {
            doc.head.appendChild(el.cloneNode(true));
        });
        // Append a deep copy of the component to the iframe
        doc.body.appendChild(component2print.cloneNode(true));

    // Print the iframe window
    iframe.contentWindow.print();
    // Remove it
    iframe.remove();
};

export function PrintablePage(props: {
    children: React.ReactElement,
    page_id: string,
}) {
    return (
        <div>
            <div className="A4-page" id={props.page_id}>
                {props.children}
            </div>
            <button
                className="download-button"
                onClick={()=>printReactComponentAsPdf(props.page_id)}
            >
                Download
            </button>
        </div>
    );
};