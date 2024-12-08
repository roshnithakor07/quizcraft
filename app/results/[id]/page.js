import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { getDb } from "../../../lib/mongodb";
import { notFound, redirect } from "next/navigation";
import ResultsClient from "./ResultsClient";

export const metadata = { title: "Quiz Results — QuizCraft" };

export default async function ResultsPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?next=/results/${params.id}`);

  const db   = await getDb();
  const quiz = await db.collection("quizzes").findOne({ shareId: params.id });
  if (!quiz) notFound();

  // Only creator can see results
  if (quiz.creatorId && quiz.creatorId !== session.user.id) {
    redirect("/dashboard");
  }

  const responses = await db
    .collection("responses")
    .find({ shareId: params.id })
    .sort({ submittedAt: -1 })
    .toArray();

  const { _id, ...safeQuiz } = quiz;
  safeQuiz.createdAt = quiz.createdAt?.toISOString();
  safeQuiz.expiresAt = quiz.expiresAt?.toISOString();

  const safeResponses = responses.map(({ _id, ...r }) => ({
    ...r,
    submittedAt: r.submittedAt?.toISOString(),
  }));

  return <ResultsClient quiz={safeQuiz} responses={safeResponses} shareId={params.id} />;
}