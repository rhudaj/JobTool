import { NextRequest, NextResponse } from "next/server";
import { resumeItemAssistant } from "@/server/assistants/editResumeItem";

export async function POST(request: NextRequest) {
  try {
    if (!resumeItemAssistant) {
      return NextResponse.json(
        { error: "Assistant not available" },
        { status: 503 }
      );
    }

    const params = await request.json();
    const result = await resumeItemAssistant.askQuestion(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error editing resume item:", error);
    return NextResponse.json(
      { error: "Failed to edit resume item" },
      { status: 500 }
    );
  }
}
