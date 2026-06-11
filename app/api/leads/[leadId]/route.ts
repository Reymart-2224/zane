import { NextResponse } from "next/server";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type RouteParams = {
  params: Promise<{
    leadId: string;
  }>;
};

const allowedStatuses = [
  "new",
  "answered",
  "sales",
  "canceled",
  "not_interested",
];

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { leadId } = await params;
    const body = await request.json();

    const { status, notes } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Missing lead ID" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = String(notes).trim();
    }

    await updateDoc(doc(db, "leads", leadId), updateData);

    return NextResponse.json({
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update lead",
      },
      { status: 500 }
    );
  }
}