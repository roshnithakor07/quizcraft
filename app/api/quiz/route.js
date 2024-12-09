import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { quiz } = body;

    if (!quiz?.questions?.length) {
      return NextResponse.json({ error: "Invalid quiz data." }, { status: 400 });
    }

    const db      = await getDb();
    const shareId = generateId();

    const doc = {
      shareId,
      creatorId:   session?.user?.id   ?? null,
      creatorName: session?.user?.name ?? null,
      title:       quiz.title    || "Untitled Quiz",
      topic:       quiz.topic    || "",
      language:    quiz.language || "English",
      questions:   quiz.questions,
      createdAt:   new Date(),
      expiresAt:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const result = await db.collection("quizzes").insertOne(doc);

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 });
    }

    console.log(`[Quiz saved] shareId=${shareId} creatorId=${doc.creatorId} title="${doc.title}"`);
    return NextResponse.json({ success: true, shareId });

  } catch (err) {
    console.error("Save quiz error:", err);
    return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 });
  }
}