import { NextResponse } from "next/server";
import { DB, connectDB } from "@/lib/db";

export async function GET() {
    try {
        console.debug("[GET] api/cvs/metadata")
        await connectDB();
        const cvs = await DB.all_cvs();

        // Return only metadata (name, path, tags) without the data
        const metadata = cvs.map((cv) => ({
            name: cv.name,
            path: cv.path,
            tags: cv.tags,
        }));

        return NextResponse.json(metadata);
    } catch (error) {
        console.error("Error fetching CV metadata:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to fetch CV metadata",
                details: errorMessage,
            },
            { status: 500 }
        );
    }
}
