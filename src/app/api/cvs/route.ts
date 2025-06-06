import { NextRequest, NextResponse } from "next/server";
import { DB, connectDB } from "@/lib/db";
import { NamedCV } from "@/lib/types";

export async function GET() {
  try {
    await connectDB();
    const cvs = await DB.all_cvs();
    return NextResponse.json(cvs);
  } catch (error) {
    console.error("Error fetching CVs:", error);

    // Extract specific file information if available
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: "Failed to fetch CVs",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data: NamedCV = await request.json();
    await DB.save_new_cv(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving CV:", error);
    return NextResponse.json(
      { error: "Failed to save CV" },
      { status: 500 }
    );
  }
}
