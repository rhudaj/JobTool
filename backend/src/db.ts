import { NamedCV } from "job-tool-shared-types"
import * as mongo from "mongodb"

const url = process.env.MONGODB_URI

class DB {

    private static db: mongo.Db = null

    private static cols = {
        cv: "cvs",
        cv_info: "cv_info",
        annotations: "annotations"
    }

    static async connect(): Promise<boolean> {

        if (!url) {
            throw new Error("MongoDB URI is not defined")
        }

        console.log(`Attempting to connect to MongoDB (${url})`)

        // try to connect

        try {
            const client = await mongo.MongoClient.connect(url)
            this.db = client.db()
        } catch (err) {
            console.error("Error connecting to MongoDB", err)
            return false
        }

        // ensure all the collections exist
        const db_cols = (await this.db.listCollections().toArray()).map(col => col.name)
        const my_cols = Object.values(this.cols)

        if(my_cols.map(c => db_cols.includes(c)).includes(false)){
            console.error(`Collections in DB: ${db_cols}`)
            console.error(`Expected collections: ${my_cols}`)
            return false
        }

        return true
    };

    // -------------------------------------------------------------------------
    //                                  cv
    // -------------------------------------------------------------------------

    static async all_cvs(): Promise<any[]> {
        return this.db
            .collection(this.cols.cv)
            .find()
            .toArray()
    }

    static async save_new_cv(cv: NamedCV): Promise<void> {
        await this.db
            .collection(this.cols.cv)
            .insertOne(cv)
    }

    static async update_cv(cv: NamedCV, name: string): Promise<void> {
        // 1. Find the cv by name
        const doc = await this.db
            .collection(this.cols.cv)
            .findOneAndUpdate({ name }, { $set: cv })
        if(!doc) throw new Error(
            `Error updating cv in the database (doc with name '${name}' not found)`
        )
    }

    static async delete_cv(name: string): Promise<void> {
        const doc = await this.db
            .collection(this.cols.cv)
            .findOneAndDelete({ name })
        if(!doc) throw new Error(
            `Error deleting cv from the database (doc with name '${name}' not found)`
        )
    }

    // -------------------------------------------------------------------------
    //                                  cv info
    // -------------------------------------------------------------------------

    static async cv_info(): Promise<any> {
        // get the one and only doc
        const r = await this.db
            .collection(this.cols.cv_info)
            .findOne()
        delete r._id // Don't need this field (messes up the frontend)
        if(!r) throw new Error("Error getting cv_info from the database")
        return r
    }

    static async save_cv_info(newVal: any): Promise<void> {
        // update the one and only doc
        await this.db
            .collection(this.cols.cv_info)
            .updateOne({}, { $set: newVal })
    }

    // -------------------------------------------------------------------------
    //                                  annotations
    // -------------------------------------------------------------------------

    static async save_annotation(data: { job: string, ncv?: NamedCV, annotations?: any }): Promise<any> {
        await this.db
            .collection(this.cols.annotations)
            .insertOne(data)
    }

};


export { DB };