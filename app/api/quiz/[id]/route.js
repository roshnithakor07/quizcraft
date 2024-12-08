import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db     = await getDb();
    const quiz   = await db.collection("quizzes").findOne({ shareId: id });
    if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    const { _id, ...safe } = quiz;
    return NextResponse.json({ success: true, quiz: safe });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch quiz." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const { id } = params;
    const db     = await getDb();
    const quiz   = await db.collection("quizzes").findOne({ shareId: id });

    if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    if (quiz.creatorId !== session.user.id)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    await db.collection("quizzes").deleteOne({ shareId: id });
    await db.collection("responses").deleteMany({ shareId: id }); // clean up responses too
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete quiz." }, { status: 500 });
  }
}