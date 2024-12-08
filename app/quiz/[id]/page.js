import { getDb } from "../../../lib/mongodb";
import { notFound } from "next/navigation";
import TakeQuizClient from "./TakeQuizClient";

export async function generateMetadata({ params }) {
  const db   = await getDb();
  const quiz = await db.collection("quizzes").findOne({ shareId: params.id });
  if (!quiz) return { title: "Quiz not found — QuizCraft" };
  return { title: `${quiz.title} — QuizCraft` };
}

export default async function TakeQuizPage({ params }) {
  const db   = await getDb();
  const quiz = await db.collection("quizzes").findOne({ shareId: params.id });
  if (!quiz) notFound();

  const { _id, ...safeQuiz } = quiz;
  safeQuiz.createdAt = quiz.createdAt?.toISOString();
  safeQuiz.expiresAt = quiz.expiresAt?.toISOString();

  return <TakeQuizClient quiz={safeQuiz} shareId={params.id} />;
}