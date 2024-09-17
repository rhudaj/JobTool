import PDFDocument from "pdfkit";
import * as fs from "fs";

export function outputCLPDF(
    paragraphs: string[],
    pdf_path: string
) {
    // Create a document
    const doc = new PDFDocument({
        font: undefined,
        margins: { top: 70, left: 60, bottom: 70, right: 60 }
    });

    // Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(
        fs.createWriteStream(pdf_path)
    );

    // Add content
    paragraphs.forEach((P: string)=>{
        doc.text(P)
        doc.moveDown(1)
    });

    // Finalize PDF file
    doc.end();
};

// export function outputCLPDF_2(
//     paragraphs: string[],
//     res: any
// ) {
//     // Create a document
//     const doc = new PDFDocument({
//         font: undefined,
//         margins: { top: 70, left: 60, bottom: 70, right: 60 }
//     });

//     // setup pipe(s):

//         res.pipe(res); // send the output of the PDF document to the HTTP response

//     // Add content

//         paragraphs.forEach((P: string)=>{
//             doc.text(P)
//             doc.moveDown(1)
//         });

//     // Finalize PDF file

//         doc.end();
// };
