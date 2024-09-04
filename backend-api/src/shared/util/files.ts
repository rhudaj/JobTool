import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

/*
    All output/input files are relative to the /public folder
*/

export function outFile(pathFromPublic: string, data: any) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const publicFolder = resolve(__dirname, "../../public/");
    const filePath = publicFolder + pathFromPublic;
    fs.writeFile(filePath, data, (e) =>
        console.log(e ? e.message : `The file has been saved: ${pathFromPublic}`)
    ); // overwrites by default
};
