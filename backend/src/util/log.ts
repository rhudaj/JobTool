import * as fs from "fs";

export class Log {
    private path: string;
    private logId: string;
    constructor(logId: string = undefined) {
        if(logId) this.setup(logId);
    };

    /**
     * Setup the log directory
     * @param logId
     */
    setup(logId: string) {
        this.logId = logId;
        this.path = process.cwd() + "/public/logs/" + this.logId;
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path);
        }
    };

    isSetup() {
        return this.path ? true : false;
    };

    addFile(name: string, content: any) {
        if(!this.path) {
            console.log("Log path not set. Use setup(logId) first.");
            return;
        }
        const filePath = this.path + "/" + name;
        fs.writeFile(filePath, JSON.stringify(content), (e) =>
            console.log(e ? e.message : `The file has been saved: ${filePath}`)
        );
    };
};