import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const samplesDir = path.join(process.cwd(), "public", "samples", "CVs");

    // Check if the directory exists
    if (!fs.existsSync(samplesDir)) {
      return NextResponse.json({ files: [] });
    }

    // Read all files in the directory
    const files = fs.readdirSync(samplesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file);

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error reading samples directory:", error);
    return NextResponse.json(
      { error: "Failed to read samples directory" },
      { status: 500 }
    );
  }
}
