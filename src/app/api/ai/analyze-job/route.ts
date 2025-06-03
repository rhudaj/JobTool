import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_text } = body;

    if (!job_text) {
      return NextResponse.json(
        { error: "Job text is required" },
        { status: 400 }
      );
    }

    // For now, return a mock analysis
    // TODO: Implement actual job analysis using existing JobExtract functionality
    const mockAnalysis = [
      {
        type: "company",
        value: "Unknown Company",
        confidence: 0.5
      },
      {
        type: "position",
        value: "Software Developer",
        confidence: 0.7
      },
      {
        type: "skills",
        value: ["JavaScript", "React", "Node.js"],
        confidence: 0.8
      }
    ];

    return NextResponse.json({
      analysis: mockAnalysis,
      success: true
    });
  } catch (error) {
    console.error("Error analyzing job:", error);
    return NextResponse.json(
      { error: "Failed to analyze job" },
      { status: 500 }
    );
  }
}
