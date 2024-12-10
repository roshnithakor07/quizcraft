import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { getDb } from "../../../../lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

    const db      = await getDb();
    const quizzes = await db.collection("quizzes")
      .find({ creatorId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    const shareIds       = quizzes.map(q => q.shareId);
    const responseCounts = await db.collection("responses").aggregate([
      { $match: { shareId: { $in: shareIds } } },
      { $group: { _id: "$shareId", count: { $sum: 1 }, avgScore: { $avg: "$percentage" } } },
    ]).toArray();

    const countMap = {};
    responseCounts.forEach(r => { countMap[r._id] = { count: r.count, avgScore: Math.round(r.avgScore) }; });

    const safe = quizzes.map(({ _id, ...q }) => ({
      ...q,
      responses: countMap[q.shareId] || { count: 0, avgScore: 0 },
      createdAt: q.createdAt?.toISOString(),
      expiresAt: q.expiresAt?.toISOString(),
    }));

    return NextResponse.json({ success: true, quizzes: safe });
  } catch (err) {
    console.error("Dashboard quizzes error:", err);
    return NextResponse.json({ error: "Failed to fetch quizzes." }, { status: 500 });
  }
}