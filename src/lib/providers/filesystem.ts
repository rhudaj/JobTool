// File System Provider Implementation (reads from public folder)
import { NamedCV } from "@/lib/types";
import { DatabaseProvider, CVInfo, Annotation } from "./types";
import fs from "fs";
import path from "path";

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
    const cvsPath = path.join(this.basePath, "CVs");
    if (!fs.existsSync(cvsPath)) {
      console.error(`CVs directory does not exist: ${cvsPath}`);
      return false;
    }

    // Check if cv_info.json exists
    const cvInfoPath = path.join(this.basePath, "cv_info.json");
    if (!fs.existsSync(cvInfoPath)) {
      console.error(`cv_info.json does not exist: ${cvInfoPath}`);
      return false;
    }

    this.isConnected = true;
    console.log('Connected to File System Provider');
    return true;
  }

  // -------------------------------------------------------------------------
  //                                  CV operations
  // -------------------------------------------------------------------------

  async all_cvs(): Promise<NamedCV[]> {
    const cvs: NamedCV[] = [];

    // Read from both CVs and user_cvs directories
    const directories = [
      { path: path.join(this.basePath, "CVs"), prefix: "CVs" },
      { path: path.join(this.basePath, "user_cvs"), prefix: "user_cvs" }
    ];

    for (const dir of directories) {
      // Skip if directory doesn't exist
      if (!fs.existsSync(dir.path)) {
        continue;
      }

      // Read all JSON files in the directory
      const files = fs.readdirSync(dir.path)
        .filter(file => file.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(dir.path, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const cv: NamedCV = JSON.parse(content);

          // Ensure the CV has a name (use filename if not present)
          if (!cv.name) {
            cv.name = path.basename(file, '.json');
          }

          // Set path for reference
          cv.path = `${dir.prefix}/${file}`;

          cvs.push(cv);
        } catch (error) {
          console.error(`Error reading CV file ${file}:`, error);
        }
      }
    }

    return cvs;
  }

  async save_new_cv(cv: NamedCV): Promise<void> {
    // For file system provider, we'll write to a special user directory
    // to avoid modifying the samples
    const userCvsPath = path.join(this.basePath, "user_cvs");

    // Create user_cvs directory if it doesn't exist
    if (!fs.existsSync(userCvsPath)) {
      fs.mkdirSync(userCvsPath, { recursive: true });
    }

    // Set path for reference (consistent with all_cvs behavior)
    cv.path = `user_cvs/${cv.name}.json`;

    const filePath = path.join(userCvsPath, `${cv.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cv, null, 2));

    console.log(`Saved new CV to: ${filePath}`);
  }

  async update_cv(cv: NamedCV, name: string): Promise<void> {
    // Look for the CV in both samples and user directories
    const possiblePaths = [
      path.join(this.basePath, "CVs", `${name}.json`),
      path.join(this.basePath, "user_cvs", `${name}.json`)
    ];

    let targetPath: string | null = null;

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        targetPath = possiblePath;
        break;
      }
    }

    if (!targetPath) {
      // If not found, create it in user_cvs
      const userCvsPath = path.join(this.basePath, "user_cvs");
      if (!fs.existsSync(userCvsPath)) {
        fs.mkdirSync(userCvsPath, { recursive: true });
      }
      targetPath = path.join(userCvsPath, `${cv.name}.json`);
      cv.path = `user_cvs/${cv.name}.json`;
    } else {
      // Update path based on where the file is located
      if (targetPath.includes("user_cvs")) {
        cv.path = `user_cvs/${cv.name}.json`;
      } else {
        cv.path = `CVs/${cv.name}.json`;
      }
    }

    fs.writeFileSync(targetPath, JSON.stringify(cv, null, 2));
    console.log(`Updated CV at: ${targetPath}`);
  }

  async delete_cv(name: string): Promise<void> {
    // Look for the CV in both samples and user directories
    const possiblePaths = [
      path.join(this.basePath, "CVs", `${name}.json`),
      path.join(this.basePath, "user_cvs", `${name}.json`)
    ];

    let deleted = false;

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        fs.unlinkSync(possiblePath);
        console.log(`Deleted CV at: ${possiblePath}`);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      throw new Error(`CV with name "${name}" not found`);
    }
  }

  // -------------------------------------------------------------------------
  //                                  CV Info operations
  // -------------------------------------------------------------------------

  async cv_info(): Promise<CVInfo> {
    const cvInfoPath = path.join(this.basePath, "cv_info.json");

    try {
      const content = fs.readFileSync(cvInfoPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Error reading cv_info.json: ${error}`);
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
        const content = fs.readFileSync(annotationsPath, 'utf-8');
        annotations = JSON.parse(content);
      } catch (error) {
        console.error("Error reading existing annotations:", error);
        annotations = [];
      }
    }

    // Add new annotation
    annotations.push({
      ...data,
      timestamp: new Date().toISOString()
    });

    // Save back to file
    fs.writeFileSync(annotationsPath, JSON.stringify(annotations, null, 2));
    console.log(`Saved annotation to: ${annotationsPath}`);
  }
}
