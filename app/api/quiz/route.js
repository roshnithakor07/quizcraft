import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

// nanoid v5 is ESM-only — use built-in crypto instead
function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { quiz } = body;

    if (!quiz?.questions?.length) {
      return NextResponse.json({ error: "Invalid quiz data." }, { status: 400 });
    }

    const db = await getDb();
    const shareId = generateId();

    const doc = {
      shareId,
      title:     quiz.title     || "Untitled Quiz",
      topic:     quiz.topic     || "",
      language:  quiz.language  || "English",
      questions: quiz.questions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    await db.collection("quizzes").insertOne(doc);

    return NextResponse.json({ success: true, shareId });
  } catch (err) {
    console.error("Save quiz error:", err);
    return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 });
  }
}