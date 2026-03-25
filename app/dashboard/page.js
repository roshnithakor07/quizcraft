import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { getDb } from "../../lib/mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "My Quizzes — QuizCraft" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const db = await getDb();
  const quizzes = await db
    .collection("quizzes")
    .find({ creatorId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  // Get response counts for each quiz
  const shareIds = quizzes.map(q => q.shareId);
  const responseCounts = await db
    .collection("responses")
    .aggregate([
      { $match: { shareId: { $in: shareIds } } },
      { $group: { _id: "$shareId", count: { $sum: 1 }, avgScore: { $avg: "$percentage" } } },
    ])
    .toArray();

  const countMap = {};
  responseCounts.forEach(r => { countMap[r._id] = { count: r.count, avgScore: Math.round(r.avgScore) }; });

  const safeQuizzes = quizzes.map(({ _id, ...q }) => ({
    ...q,
    responses: countMap[q.shareId] || { count: 0, avgScore: 0 },
    createdAt: q.createdAt?.toISOString(),
  }));

  return <DashboardClient quizzes={safeQuizzes} user={session.user} />;
}