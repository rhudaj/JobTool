import { NextRequest, NextResponse } from "next/server";
import { DB, connectDB } from "@/lib/database";
import { NamedCV } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data: { job: string, ncv?: NamedCV, annotations?: any } = await request.json();
    await DB.save_annotation(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving annotation:", error);
    return NextResponse.json(
      { error: "Failed to save annotation" },
      { status: 500 }
    );
  }
}
