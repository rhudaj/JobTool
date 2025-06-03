import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/db";
import { connectDB } from "@/lib/db";

// GET /api/cv-info - Get CV info
export async function GET() {
  try {
    await connectDB();
    const cvInfo = await DB.cv_info();
    console.log("Got CV info from backend:", cvInfo);
    return NextResponse.json(cvInfo);
  } catch (error) {
    console.error("Error fetching CV info:", error);
    return NextResponse.json(
      { error: "Failed to fetch CV info" },
      { status: 500 }
    );
  }
}

// PUT /api/cv-info - Save CV info
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    console.log("PUT request to /api/cv-info");
    await DB.save_cv_info(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving CV info:", error);
    return NextResponse.json(
      { error: "Failed to save CV info" },
      { status: 500 }
    );
  }
}
