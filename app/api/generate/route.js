import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = `You are QuizCraft — an expert educator who creates precise, high-quality multiple-choice quizzes.

Generate a quiz ONLY as valid JSON. No markdown, no preamble, no explanation outside the JSON.

Return EXACTLY this structure:
{
  "title": "Short topic title (4-6 words)",
  "topic": "1-sentence description of what was analysed",
  "questions": [
    {
      "id": 1,
      "question": "Clear, unambiguous question text?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "answer": "B",
      "explanation": "Brief explanation of why B is correct and why others are wrong."
    }
  ]
}

Rules:
- Always produce exactly the number of questions requested
- Answer must be exactly one of: "A", "B", "C", "D"
- All 4 options must be plausible, no obviously wrong answers
- Easy: factual recall from the text
- Medium: comprehension and inference
- Hard: analysis, application, and critical thinking
- Explanations must be concise (1-2 sentences max)
- Never repeat questions
- Questions must be directly based on provided content`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, imageBase64, count, difficulty } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Provide text or an image." }, { status: 400 });
    }

    // Image tab with no text — Groq doesn't support vision
    if (imageBase64 && !text) {
      return NextResponse.json({
        error: "Image analysis is not supported with the free Groq API. Please switch to the Text tab and paste your content instead."
      }, { status: 400 });
    }

    if (text && text.trim().length < 20) {
      return NextResponse.json({ error: "Text too short to generate meaningful questions." }, { status: 400 });
    }

    const prompt = `Generate ${count} ${difficulty}-level multiple choice questions from the content below.\n\nReturn ONLY valid JSON, no markdown.\n\nContent:\n${text}`;

    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user",   content: prompt },
      ],
    });

    const raw   = message.choices[0].message.content.trim();
    const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

    let quiz;
    try {
      quiz = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Could not parse quiz. Please try again." },
        { status: 500 }
      );
    }

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      return NextResponse.json({ error: "Invalid quiz format returned." }, { status: 500 });
    }

    return NextResponse.json({ success: true, quiz });
  } catch (err) {
    console.error("Quiz generation error:", err);

    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit hit. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed. Try again." },
      { status: 500 }
    );
  }
}