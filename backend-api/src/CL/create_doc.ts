import * as fs from "fs"
import pkg from "docx";
const { Document, Paragraph, Packer } = pkg;

import { CoverLetterResponse } from "shared";

const styleID = "customStyle";

// HELPERS:
const newParagraph = (txt: string) =>
    new Paragraph({
        text: txt,
        style: styleID,
    });
const addParagraphs = (arr: string[]) => arr.map(newParagraph);

export async function outputCLDoc(
    CL: CoverLetterResponse
): Promise<null|Buffer> {
    let isError = false;
    try {
        var doc = new Document({
            sections: [
                {
                    children: addParagraphs([
                        new Date().toDateString(),
                        "Dear hiring manager,",
                        CL.intro,
                        ...CL.body_paragraphs,
                        "Sincerely,",
                        "Roman Hudaj",
                    ]),
                },
            ],
            styles: {
                paragraphStyles: [
                    {
                        id: styleID,
                        name: "My Custom Style",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            font: "Calibri",
                            size: "11pt",
                        },
                        paragraph: {
                            spacing: {
                                line: 276,
                                before: 240,
                                after: 120,
                            },
                        },
                    },
                ],
            },
        });
    } catch (err: unknown) {
        console.log("Error outputting to CL to .docx:", err);
        isError = true;
    }

    // Save the document locally:
    Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync("public/out/cl.docx", buffer);
    });

    return isError ? null : Packer.toBuffer(doc);
    // return isError;
};
