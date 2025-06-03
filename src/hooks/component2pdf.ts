import { useLogger } from "./logger";

/**
 *  Print a react component as a pdf
 * @param element_id of the react component you wish to print as pdf
 */
export const useComponent2PDF = (element_id: string) => {

    const [ log, warn, error ] = useLogger("component2pdf\n\t");

    const saveAsPDF = (name: string = "my_resume") => {

        // get the react component with id element_id
        const component2print = document.getElementById(element_id);

        if (!component2print) {
            error(`Element with id ${element_id} not found`);
            return;
        }

        // Copy all <style> and <link type="stylesheet" /> tags from <head> inside the parent window
        const head_styles: Element[] = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));

        if (head_styles.length === 0) {
            warn("No styles to copy");
        }

        // iframe (to print the component)
        const iframe = document.createElement('iframe');
            // hide it from view (Instead of setting display: none, you can set the iframe's visibility to hidden. This way, the iframe is still rendered but not visible.)
            iframe.style.display = 'hidden';
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

        // Adding a slight delay before calling print() can give the browser enough time to fully render the iframe content:
        setTimeout(() => {
            // The saved pdf's name is the document's title by default.
            // So, to set the name, change the doc title temporarily.
            const prev_title = document.title;
            document.title = name;
            iframe.contentWindow.print();
            document.title = prev_title;
            // remove ifram from DOM, as no longer needed
            iframe.remove();
        }, 300);

        log("Printing component with id: ", element_id);
    };

    return saveAsPDF
};
