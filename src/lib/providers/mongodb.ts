// MongoDB Provider Implementation
import * as mongo from "mongodb";
import { NamedCV } from "@/lib/types";
import { DatabaseProvider, CVInfo, Annotation } from "./types";

export class MongoDBProvider implements DatabaseProvider {
  private db: mongo.Db;
  private isConnected = false;

  private readonly cols = {
    cv: "cvs",
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
  //                                  CV operations
  // -------------------------------------------------------------------------

  async all_cvs(): Promise<NamedCV[]> {
    const results = await this.db
      .collection(this.cols.cv)
      .find()
      .toArray();

    // Convert MongoDB documents to NamedCV type by removing _id
    return results.map(doc => {
      const { _id, ...cv } = doc;
      return cv as NamedCV;
    });
  }

  async save_new_cv(cv: NamedCV): Promise<void> {
    await this.db
      .collection(this.cols.cv)
      .insertOne(cv);
  }

  async update_cv(cv: NamedCV, name: string): Promise<void> {
    await this.db
      .collection(this.cols.cv)
      .updateOne({ name }, { $set: cv });
  }

  async delete_cv(name: string): Promise<void> {
    await this.db
      .collection(this.cols.cv)
      .deleteOne({ name });
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
