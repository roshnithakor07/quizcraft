import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db   = await getDb();
    const quiz = await db.collection("quizzes").findOne({ shareId: id });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    // Remove MongoDB _id before sending
    const { _id, ...safe } = quiz;
    return NextResponse.json({ success: true, quiz: safe });
  } catch (err) {
    console.error("Get quiz error:", err);
    return NextResponse.json({ error: "Failed to fetch quiz." }, { status: 500 });
  }
}