// function component2PDF() {
//     window.addEventListener("beforeprint", () => console.log("before print..."));
//     window.addEventListener("afterprint", () => console.log("after print..."));

//     const el2print = document.getElementById("A4-page-cl");
//     const printContents = el2print.innerHTML;

//     let mywindow = window.open('', '', 'height=650,width=900');
//     mywindow.document.write(`<html><head>`);
//     // mywindow.document.write('<link rel="stylesheet" type="text/css" href="http://localhost:3000/test.css"/>');
//     mywindow.document.write('</head><body >');
//     mywindow.document.write(printContents);
//     mywindow.document.write('</body></html>');
//     mywindow.document.close(); // necessary for IE >= 10
//     mywindow.focus(); // necessary for IE >= 10*/

//     // let CSS load before printing..
//     setTimeout(function () {
//         mywindow.close();
//     }, 500);

//     mywindow.print()
//     // mywindow.close();
// }


// const PrintComponent = () => {
//     const clEditorRef = useRef(null);

//     // returns a handlePrint function which when called will trigger the print action.
//     const handlePrint = useReactToPrint({
//         // A function that returns a component reference value. The content of this reference value is then used for print. Alternatively, pass the content directly to the callback returned by useReactToPrint:
//         // Copy all <style> and <link type="stylesheet" /> tags from <head> inside the parent window into the print window. (default: true)
//             // content: () => componentRef.current,
//         //Copy all <style> and <link type="stylesheet" /> tags from <head> inside the parent window into the print window. (default: true)
//             copyStyles: true,
//         // Set the title for printing when saving as a file:
//             documentTitle: "NoTitle",
//         // Callback function that triggers after the print dialog is closed regardless of if the user selected to print or cancel
//             onAfterPrint: undefined,
//         // Callback function that triggers before the library gathers the page's content. Either returns void or a Promise. This can be used to change the content on the page before printing
//             onBeforeGetContent: undefined,
//         // Callback function that triggers before print. Either returns void or a Promise. Note: this function is run immediately prior to printing, but after the page's content has been gathered.
//             onBeforePrint: undefined,
//         // Callback function (signature: function(errorLocation: 'onBeforePrint' | 'onBeforeGetContent' | 'print', error: Error)) that will be called if there is a printing error serious enough that printing cannot continue. Currently limited to Promise rejections in onBeforeGetContent, onBeforePrint, and print. Use this to attempt to print again. errorLocation will tell you in which callback the Promise was rejected
//             onPrintError: undefined,
//         // We set some basic styles to help improve page printing. Use this to override them and provide your own. If given as a function it must return a string
//             pageStyle: undefined,
//         // If passed, this function will be used instead of window.print to print the content. This function is passed the HTMLIFrameElement which is the iframe used internally to gather content for printing. When finished, this function must return a Promise. Use this to print in non-browser environments such as Electron
//             print: undefined,
//         // Remove the print iframe after action. Defaults to false
//             removeAfterPrint: false,
//         // A function that returns a React Component or Element. Note: under the hood, we inject a custom onClick prop into the returned Component/Element. As such, do not provide an onClick prop to the root node returned by trigger, as it will be overwritten
//             trigger: undefined,
//     });

//     // Any styles at the level of #print-container or above will not be applied to the print
//     return (
//       <>
//         <CLEditor2 ref={clEditorRef} cl_paragraphs={cl_paragraphs}/>
//         <button
//             className="download-button"
//             onClick={()=>handlePrint(null, () => clEditorRef.current.get())}
//             style={{fontSize:"16em"}}
//         >
//             Download
//         </button>
//       </>
//     );
// };