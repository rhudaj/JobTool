import * as fs from "fs";

/*
    All output/input files are relative to the /public folder
*/
export function outFile(pathFromPublic: string, data: any) {
    const publicFolder = process.cwd() + "/public/"
    const filePath = publicFolder + pathFromPublic;
    fs.writeFile(filePath, data, (e) =>
        console.log(e ? e.message : `The file has been saved: ${pathFromPublic}`)
    ); // overwrites by default
};

export class Log {
    private path: string;
    constructor(logId: string) {
        this.path = process.cwd() + "/public/logs/" + logId;
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path);
        }
    };

    addFile(name: string, content: any) {
        const filePath = this.path + "/" + name;
        fs.writeFile(filePath, JSON.stringify(content), (e) =>
            console.log(e ? e.message : `The file has been saved: ${filePath}`)
        );
    };
};