// MongoDB Provider Implementation
import * as mongo from "mongodb";
import { NamedCV, NamedCVContent, CVCore } from "@/lib/types";
import { DatabaseProvider } from "./IDatabaseProvider";
import { CVInfo, Annotation } from "@/lib/types";
import { mergeNamedContentWithCore, extractContentFromNamedCV } from "../cv-converter";

export class MongoDBProvider implements DatabaseProvider {
  private db: mongo.Db;
  private isConnected = false;

  private readonly cols = {
    cv: "cvs",
    cv_core: "cv_core",
    cv_info: "cv_info",
    annotations: "annotations"
  };

  constructor(private connectionUrl: string) {}

  async connect(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    if (!this.connectionUrl) {
      throw new Error("MongoDB URI is not defined");
    }

    console.log(`Attempting to connect to MongoDB (${this.connectionUrl})`);

    try {
      const client = await mongo.MongoClient.connect(this.connectionUrl);
      this.db = client.db();
    } catch (err) {
      console.error("Error connecting to MongoDB", err);
      return false;
    }

    // Ensure all the collections exist
    const db_cols = (await this.db.listCollections().toArray()).map(col => col.name);
    const my_cols = Object.values(this.cols);

    if (my_cols.map(c => db_cols.includes(c)).includes(false)) {
      console.error(`Collections in DB: ${db_cols}`);
      console.error(`Expected collections: ${my_cols}`);
      return false;
    }

    this.isConnected = true;
    return true;
  }

  // -------------------------------------------------------------------------
  //                                  CV operations (Legacy - merged with core)
  // -------------------------------------------------------------------------

  async all_cvs(): Promise<NamedCV[]> {
    // Get content and core, then merge them
    const contents = await this.all_cv_contents();
    const core = await this.cv_core();

    return contents.map(content => mergeNamedContentWithCore(content, core));
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
    await this.db
      .collection(this.cols.cv)
      .deleteOne({ name });
  }

  // -------------------------------------------------------------------------
  //                                  CV Content operations (New structure)
  // -------------------------------------------------------------------------

  async all_cv_contents(): Promise<NamedCVContent[]> {
    const results = await this.db
      .collection(this.cols.cv)
      .find()
      .toArray();

    // Convert MongoDB documents to NamedCVContent type by removing _id
    return results.map(doc => {
      const { _id, ...content } = doc;

      // Check if it's old format (has header_info) or new format
      if (content.data && content.data.header_info) {
        // Old format - convert to new format
        return extractContentFromNamedCV(content as NamedCV);
      } else {
        // New format - use as-is
        return content as NamedCVContent;
      }
    });
  }

  async save_new_cv_content(cv: NamedCVContent): Promise<void> {
    await this.db
      .collection(this.cols.cv)
      .insertOne(cv);
  }

  async update_cv_content(cv: NamedCVContent, name: string): Promise<void> {
    await this.db
      .collection(this.cols.cv)
      .updateOne({ name }, { $set: cv });
  }

  // -------------------------------------------------------------------------
  //                                  CV Core operations
  // -------------------------------------------------------------------------

  async cv_core(): Promise<CVCore> {
    // Get the one and only doc
    const r = await this.db
      .collection(this.cols.cv_core)
      .findOne();

    if (!r) throw new Error("Error getting cv_core from the database");
    delete r._id; // Don't need this field (messes up the frontend)
    return r as unknown as CVCore;
  }

  async save_cv_core(core: CVCore): Promise<void> {
    // Update the one and only doc
    await this.db
      .collection(this.cols.cv_core)
      .updateOne({}, { $set: core }, { upsert: true });
  }

  // -------------------------------------------------------------------------
  //                                  CV Info operations
  // -------------------------------------------------------------------------

  async cv_info(): Promise<CVInfo> {
    // Get the one and only doc
    const r = await this.db
      .collection(this.cols.cv_info)
      .findOne();

    if (!r) throw new Error("Error getting cv_info from the database");
    delete r._id; // Don't need this field (messes up the frontend)
    return r;
  }

  async save_cv_info(newVal: CVInfo): Promise<void> {
    // Update the one and only doc
    await this.db
      .collection(this.cols.cv_info)
      .updateOne({}, { $set: newVal });
  }

  // -------------------------------------------------------------------------
  //                                  Annotations operations
  // -------------------------------------------------------------------------

  async save_annotation(data: Annotation): Promise<void> {
    await this.db
      .collection(this.cols.annotations)
      .insertOne(data);
  }
}
