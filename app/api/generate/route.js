import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = (language) => `You are QuizCraft — an expert educator who creates precise, high-quality multiple-choice quizzes.

Generate a quiz ONLY as valid JSON. No markdown, no preamble, no explanation outside the JSON.

IMPORTANT: Generate ALL questions in ${language} language.

Return EXACTLY this structure:
{
  "title": "Short topic title (4-6 words)",
  "topic": "1-sentence description of what was analysed",
  "questions": [
    {
      "id": 1,
      "question": "Clear question text in ${language}?",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "B",
      "explanation": "Brief explanation in ${language} of why B is correct."
    }
  ]
}

Rules:
- Generate exactly the number of questions requested, no more, no less
- Answer must be exactly one of: "A", "B", "C", "D"
- All 4 options must be plausible — no obviously wrong answers
- Easy: factual recall | Medium: comprehension & inference | Hard: analysis & critical thinking
- Explanations must be concise (1–2 sentences)
- Never repeat questions
- Questions must be based on the provided content
- Write everything (questions, options, explanations) in ${language}`;

async function generateBatch(text, count, difficulty, language, startId = 1) {
  const prompt = `Generate exactly ${count} ${difficulty}-level multiple choice questions (IDs starting from ${startId}) from the content below.
Return ONLY valid JSON, no markdown.

Content:
${text}`;

  const message = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM(language) },
      { role: "user",   content: prompt },
    ],
  });

  const raw   = message.choices[0].message.content.trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();

  // Extract JSON robustly
  let parsed;
  try { parsed = JSON.parse(clean); } catch {
    const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
    if (s !== -1 && e !== -1) parsed = JSON.parse(clean.slice(s, e + 1));
  }
  return parsed;
}

export async function POST(request) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    let { text, imageBase64, imageMediaType, count = 10, difficulty = "medium", language = "English" } = body;

    // ── Image mode: extract text using Groq with a text-only prompt ──
    // Groq doesn't support vision, so we ask it to describe what text
    // would typically appear in such a context, or user passes imageBase64
    // and we tell them to use Claude/OpenAI. For now: if image+no text,
    // use Groq to generate from a placeholder noting the limitation.
    if (imageBase64 && !text) {
      // Try to extract using tesseract.js on client side isn't viable here.
      // Best approach: tell the user clearly and use the image name/type as hint.
      // If they have OpenAI key configured, we could use it — for now return helpful error.
      return NextResponse.json({
        error: "Image analysis requires a vision-capable AI. Please copy the text from your image and paste it in the Text tab, or configure an OpenAI/Claude API key in your .env.local to enable image support."
      }, { status: 400 });
    }

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: "Please provide more content to generate questions from." }, { status: 400 });
    }
    if (count < 1 || count > 200) {
      return NextResponse.json({ error: "Question count must be between 1 and 200." }, { status: 400 });
    }

    // ── Batch if > 50 questions ──────────────────────────────────
    const BATCH_SIZE = 40; // safe limit per call
    let allQuestions = [];
    let quizTitle    = "";
    let quizTopic    = "";

    if (count <= BATCH_SIZE) {
      const result = await generateBatch(text, count, difficulty, language, 1);
      if (!result?.questions) {
        return NextResponse.json({ error: "Could not parse quiz. Please try again." }, { status: 500 });
      }
      allQuestions = result.questions;
      quizTitle    = result.title || "Quiz";
      quizTopic    = result.topic || "";
    } else {
      // Multiple batches
      const batches  = [];
      let remaining  = count;
      let startId    = 1;
      while (remaining > 0) {
        const batchCount = Math.min(BATCH_SIZE, remaining);
        batches.push({ count: batchCount, startId });
        startId   += batchCount;
        remaining -= batchCount;
      }

      // Run batches sequentially to avoid rate limits
      for (const b of batches) {
        const result = await generateBatch(text, b.count, difficulty, language, b.startId);
        if (!result?.questions) continue;
        if (!quizTitle) { quizTitle = result.title || "Quiz"; quizTopic = result.topic || ""; }
        // Fix IDs to be sequential
        const fixed = result.questions.map((q, i) => ({ ...q, id: b.startId + i }));
        allQuestions.push(...fixed);
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      quiz: {
        title:     quizTitle,
        topic:     quizTopic,
        language,
        questions: allQuestions,
      },
    });

  } catch (err) {
    console.error("Generate error:", err);
    if (err?.status === 429) {
      return NextResponse.json({ error: "Rate limit hit. Please wait a moment and try again." }, { status: 429 });
    }
    return NextResponse.json({ error: "Generation failed. Try again." }, { status: 500 });
  }
}