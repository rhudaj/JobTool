// File System Provider Implementation (reads from public folder)
import {
    NamedCV,
    NamedCVContent,
    CVCore,
    CVInfo,
    Annotation,
    CVInfoContent,
} from "@/lib/types";
import { DatabaseProvider } from "./IDatabaseProvider";
import {
    mergeNamedContentWithCore,
    extractContentFromNamedCV,
    mergeCVInfoContentWithCore,
} from "../cv-converter";
import fs from "fs";
import path from "path";

const CV_INFO_FILE = "cv_info.json";
const CV_DIR = "cvs";

export class FileSystemProvider implements DatabaseProvider {
    private basePath: string;
    private isConnected = false;

    constructor() {
        this.basePath = path.join(process.cwd(), "public", "samples");
    }

    async connect(): Promise<boolean> {
        if (this.isConnected) {
            return true;
        }

        // Check if the samples directory exists
        if (!fs.existsSync(this.basePath)) {
            console.error(`Samples directory does not exist: ${this.basePath}`);
            return false;
        }

        // Check if CVs directory exists
        const cvsPath = path.join(this.basePath, CV_DIR);
        if (!fs.existsSync(cvsPath)) {
            console.error(`cv directory does not exist: ${cvsPath}`);
            return false;
        }

        // Check if cv_info.json exists
        const cvInfoPath = path.join(this.basePath, "cv_info.json");
        if (!fs.existsSync(cvInfoPath)) {
            console.error(`cv_info.json does not exist: ${cvInfoPath}`);
            return false;
        }

        // Check if cv_core.json exists
        const cvCorePath = path.join(this.basePath, "cv_core.json");
        if (!fs.existsSync(cvCorePath)) {
            console.error(`cv_core.json does not exist: ${cvCorePath}`);
            return false;
        }

        this.isConnected = true;
        console.log("Connected to File System Provider");
        return true;
    }

    // -------------------------------------------------------------------------
    //                                  CV operations (Legacy - merged with core)
    // -------------------------------------------------------------------------

    async all_cvs(): Promise<NamedCV[]> {
        console.debug("called all_cvs()");
        // Get content and core, then merge them
        const contents = await this.all_cv_contents();
        const core = await this.cv_core();

        const results = [];

        contents.forEach((content) => {
            try {
                let result = mergeNamedContentWithCore(content, core);
                results.push(result);
            } catch (err: unknown) {
                throw new Error(
                    `Error processing cv named '${content.name}': ${
                        err instanceof Error ? err.message : "unknown error"
                    }`
                );
            }
        });

        return results;
    }

    async save_new_cv(ncv: NamedCV): Promise<void> {
        // Extract content from full CV and save as content
        const content: NamedCVContent = extractContentFromNamedCV(ncv);
        await this.save_new_cv_content(content);
    }

    async update_cv(ncv: NamedCV, name: string): Promise<void> {
        // Extract content from full CV and save as content
        const content: NamedCVContent = extractContentFromNamedCV(ncv);
        await this.update_cv_content(content, name);
    }

    async delete_cv(name: string): Promise<void> {
        // Look for the CV in both samples and user directories
        const cv_path = path.join(this.basePath, CV_DIR, `${name}.json`);
        if (fs.existsSync(cv_path)) {
            fs.unlinkSync(cv_path);
            console.log(`Deleted CV at: ${cv_path}`);
        } else {
            throw new Error(
                `CV with name "${name}" not found at expected path: ${cv_path}`
            );
        }
    }

    // -------------------------------------------------------------------------
    //                                  CV Content operations (New structure)
    // -------------------------------------------------------------------------

    async all_cv_contents(): Promise<NamedCVContent[]> {
        const contents: NamedCVContent[] = [];

        // Read from both CVs and user_cvs directories
        const dir = path.join(this.basePath, CV_DIR);

        // Skip if directory doesn't exist
        if (!fs.existsSync(dir)) {
            throw new Error(`CV directory does not exist: ${dir}`);
        }

        // Read all JSON files in the directory
        const files = fs
            .readdirSync(dir)
            .filter((file) => file.endsWith(".json"));

        for (const file of files) {
            try {
                const filePath = path.join(dir, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const parsedContent = JSON.parse(content);

                // Check if it's old format (has header_info) - this should be an error
                if (parsedContent.data && parsedContent.data.header_info) {
                    throw new Error(
                        `CV file "${file}" is in old format (contains header_info). All CVs should use the new format without header_info.`
                    );
                }

                // New format - use as-is
                const cvContent: NamedCVContent = parsedContent;
                if (!cvContent.name) {
                    cvContent.name = path.basename(file, ".json");
                }
                cvContent.path = `${CV_DIR}/${file}`;

                contents.push(cvContent);
            } catch (error) {
                console.error(`Error reading CV file ${file}:`, error);
                // Re-throw with file information for better error handling
                throw new Error(
                    `Failed to parse CV file "${file}": ${
                        error instanceof Error ? error.message : "Unknown error"
                    }`
                );
            }
        }

        return contents;
    }

    async save_new_cv_content(cv: NamedCVContent): Promise<void> {
        // For file system provider, we'll write to a special user directory
        // to avoid modifying the samples
        const userCvsPath = path.join(this.basePath, "user_cvs");

        // Create user_cvs directory if it doesn't exist
        if (!fs.existsSync(userCvsPath)) {
            fs.mkdirSync(userCvsPath, { recursive: true });
        }

        const filePath = path.join(userCvsPath, `${cv.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(cv, null, 2));

        console.log(`Saved new CV content to: ${filePath}`);
    }

    async update_cv_content(cv: NamedCVContent, name: string): Promise<void> {
        // Look for the CV in both samples and user directories
        const cv_path = path.join(this.basePath, CV_DIR, `${name}.json`);

        if (!fs.existsSync(cv_path)) {
            throw new Error(
                `CV with name "${name}" not found at expected path: ${cv_path}`
            );
        }

        fs.writeFileSync(cv_path, JSON.stringify(cv, null, 2));
        console.log(`Updated CV content at: ${cv_path}`);
    }

    // -------------------------------------------------------------------------
    //                                  CV Core operations
    // -------------------------------------------------------------------------

    async cv_core(): Promise<CVCore> {
        const cvCorePath = path.join(this.basePath, "cv_core.json");

        try {
            const content = fs.readFileSync(cvCorePath, "utf-8");
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Error reading cv_core.json: ${error}`);
        }
    }

    async save_cv_core(core: CVCore): Promise<void> {
        const cvCorePath = path.join(this.basePath, "cv_core.json");

        try {
            fs.writeFileSync(cvCorePath, JSON.stringify(core, null, 2));
            console.log(`Saved cv_core to: ${cvCorePath}`);
        } catch (error) {
            throw new Error(`Error saving cv_core.json: ${error}`);
        }
    }

    // -------------------------------------------------------------------------
    //                                  CV Info operations
    // -------------------------------------------------------------------------

    async cv_info(): Promise<CVInfo> {
        const cvInfoPath = path.join(this.basePath, CV_INFO_FILE);
        try {
            const content_str = fs.readFileSync(cvInfoPath, "utf-8");
            const content: CVInfoContent = JSON.parse(content_str);

            const core = await this.cv_core();

            const mergedContent: CVInfo = mergeCVInfoContentWithCore(
                content,
                core
            );

            return mergedContent;
        } catch (error) {
            throw new Error(`Error reading ${CV_INFO_FILE}: ${error}`);
        }
    }

    async save_cv_info(newVal: CVInfo): Promise<void> {
        const cvInfoPath = path.join(this.basePath, "cv_info.json");

        try {
            fs.writeFileSync(cvInfoPath, JSON.stringify(newVal, null, 2));
            console.log(`Saved cv_info to: ${cvInfoPath}`);
        } catch (error) {
            throw new Error(`Error saving cv_info.json: ${error}`);
        }
    }

    // -------------------------------------------------------------------------
    //                                  Annotations operations
    // -------------------------------------------------------------------------

    async save_annotation(data: Annotation): Promise<void> {
        // For file system provider, we'll save annotations to a JSON file
        const annotationsPath = path.join(this.basePath, "annotations.json");

        let annotations: Annotation[] = [];

        // Read existing annotations if file exists
        if (fs.existsSync(annotationsPath)) {
            try {
                const content = fs.readFileSync(annotationsPath, "utf-8");
                annotations = JSON.parse(content);
            } catch (error) {
                console.error("Error reading existing annotations:", error);
                annotations = [];
            }
        }

        // Add new annotation
        annotations.push({
            ...data,
            timestamp: new Date().toISOString(),
        });

        // Save back to file
        fs.writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2));
        console.log(`Saved annotation to: ${annotationsPath}`);
    }
}
