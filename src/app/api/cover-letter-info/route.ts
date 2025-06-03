import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/db";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    const cvInfo = await DB.cv_info();
    return NextResponse.json({
      cv_info: cvInfo || []
    });
  } catch (error) {
    console.error("Error fetching cover letter info:", error);
    return NextResponse.json(
      { error: "Failed to fetch cover letter info" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { cl_info } = body;

    await DB.save_cv_info(cl_info);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving cover letter info:", error);
    return NextResponse.json(
      { error: "Failed to save cover letter info" },
      { status: 500 }
    );
  }
}
