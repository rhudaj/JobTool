import * as fs from "fs";
import pkg, { IStylesOptions } from "docx";
const { Document, Paragraph, Packer } = pkg;

import { CoverLetterResponse } from "shared";

export function outputCLDoc(CL: CoverLetterResponse, fileName: string) {
    const styleID = "customStyle";
    const newParagraph = (txt: string) =>
        new Paragraph({
            text: txt,
            style: styleID,
    });
    const addParagraphs = (arr: string[]) => arr.map(newParagraph);

    try {
        const doc = new Document({
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

        // Save the document
        Packer.toBuffer(doc).then((buffer) => {
            fs.writeFileSync(`public/out/${fileName}.docx`, buffer);
        });
    } catch (err: unknown) {
        console.log(
            "some error occured when outputting to cover letter to .docx:",
            err
        );
    }
}
