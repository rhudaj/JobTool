import { NextRequest, NextResponse } from "next/server";
import { genCL } from "@/server/assistants/coverLetter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobInfo } = body;

    if (!jobInfo) {
      return NextResponse.json(
        { error: "Job information is required" },
        { status: 400 }
      );
    }

    const result = await genCL({ jobInfo });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
