import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = await getDb();

    const [quiz, responses] = await Promise.all([
      db.collection("quizzes").findOne({ shareId: id }),
      db.collection("responses").find({ shareId: id }).sort({ submittedAt: -1 }).toArray(),
    ]);

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    }

    const { _id, ...safeQuiz } = quiz;
    const safeResponses = responses.map(({ _id, ...r }) => r);

    return NextResponse.json({ success: true, quiz: safeQuiz, responses: safeResponses });
  } catch (err) {
    console.error("Results error:", err);
    return NextResponse.json({ error: "Failed to fetch results." }, { status: 500 });
  }
}