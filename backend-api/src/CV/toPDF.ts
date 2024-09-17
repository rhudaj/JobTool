import PDFDocument from "pdfkit";
import * as fs from "fs";
import { CV } from "shared";

export function outputCVPDF(
    cv: CV,
    pdf_path: string
) {
    // Create a document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(pdf_path));

    // CONTENT
    doc.fontSize(24).font('Helvetica-Bold').text('ROMAN HUDAJ', { align: 'left' });
    doc.fontSize(12).font('Helvetica').text(cv.personalTitle, { align: 'left' });
    doc.moveDown();
    cv.links.map((link: any)=>{
        doc.text(link.text, { align: 'right' });
    });


    // Finalize PDF file

        doc.end();
};