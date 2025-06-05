import { NextRequest, NextResponse } from "next/server";
import { DB, connectDB } from "@/lib/db";
import { NamedCV } from "@/lib/types";

// PUT /api/cvs/[name] - Update existing CV
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    const data: NamedCV = await request.json();
    await DB.update_cv(data, params.name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating CV:", error);
    return NextResponse.json(
      { error: "Failed to update CV" },
      { status: 500 }
    );
  }
}

// DELETE /api/cvs/[name] - Delete CV
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    await DB.delete_cv(params.name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Failed to delete CV" },
      { status: 500 }
    );
  }
}
