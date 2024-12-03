import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { shareId, takerName, answers, questions } = body;

    if (!shareId || !answers || !questions) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Calculate score
    const correct = questions.filter(q => answers[q.id] === q.answer).length;
    const total   = questions.length;
    const pct     = Math.round((correct / total) * 100);

    const db = await getDb();
    await db.collection("responses").insertOne({
      shareId,
      takerName: takerName?.trim() || "Anonymous",
      answers,
      score:       correct,
      total,
      percentage:  pct,
      submittedAt: new Date(),
    });

    return NextResponse.json({ success: true, score: correct, total, percentage: pct });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }
}