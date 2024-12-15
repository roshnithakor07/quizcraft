import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = (language) => `You are QuizCraft — an expert educator creating multiple-choice quizzes.

Return ONLY valid compact JSON on a single line. No markdown, no newlines in the JSON, no preamble.

EXACTLY this structure (all on one line):
{"title":"Short title","topic":"1-sentence description","questions":[{"id":1,"question":"Question text?","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"B","explanation":"Why B is correct."}]}

STRICT CONTENT RULES — violations will break the quiz:
- ONLY ask about CONCEPTS, FACTS, SYNTAX, TECHNIQUES, and PRINCIPLES found in the content.
- NEVER ask about: instructor names, course names, video titles, project names, who made the video, what will be built, sponsor mentions, chapter names, or any meta information about the video/course/article itself.
- If content is a programming tutorial: ask about code syntax, language features, functions, patterns, and concepts — NOT about the project being built or who is teaching.
- If content is a lecture or talk: ask about the ideas, arguments, data, and conclusions — NOT about the speaker or event.
- Every question must be answerable by someone who understands the subject, even if they never watched the specific video.
- All 4 options must be plausible — wrong options should be common misconceptions, not obviously silly.
- Easy: factual recall | Medium: comprehension/application | Hard: analysis/reasoning
- Keep explanations under 20 words.
- Never repeat questions.
- Generate EXACTLY the number of questions requested.
- Answer must be one of: "A","B","C","D"
- Write everything in ${language}
- NO trailing commas, NO comments, NO extra text outside JSON`;

async function generateBatch(text, count, difficulty, language, startId = 1, attempt = 1) {
  const prompt = `Generate EXACTLY ${count} ${difficulty}-level questions (IDs ${startId} to ${startId + count - 1}).
Return ONLY compact single-line JSON, no markdown.

Content: ${text.slice(0, 3000)}`;

  const message = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    temperature: attempt === 1 ? 0.2 : 0.1,
    max_tokens:  8192,
    messages: [
      { role: "system", content: SYSTEM(language) },
      { role: "user",   content: prompt },
    ],
  });

  const raw = message.choices[0].message.content.trim();

  let clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i,     "")
    .replace(/\s*```$/,      "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    const s = clean.indexOf("{");
    const e = clean.lastIndexOf("}");
    if (s !== -1 && e !== -1 && e > s) {
      try { parsed = JSON.parse(clean.slice(s, e + 1)); } catch {}
    }
    if (!parsed) {
      const fixed = clean
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/\n/g, " ")
        .replace(/\t/g, " ");
      try { parsed = JSON.parse(fixed); } catch {}
    }
    if (!parsed && attempt < 2) {
      console.warn(`[generateBatch] Parse failed attempt ${attempt}, retrying…`);
      return generateBatch(text, count, difficulty, language, startId, 2);
    }
  }
  return parsed || null;
}

export async function POST(request) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      text,
      urlText,          // pre-fetched content from /api/fetch-content
      imageBase64,
      count = 10,
      difficulty = "medium",
      language = "English",
    } = body;

    // urlText takes priority over text
    const contentToUse = urlText || text;

    if (imageBase64 && !contentToUse) {
      return NextResponse.json(
        { error: "Image analysis requires a vision-capable AI. Please copy the text from your image and paste it in the Text tab." },
        { status: 400 }
      );
    }

    if (!contentToUse || contentToUse.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide more content to generate questions from." },
        { status: 400 }
      );
    }

    if (count < 1 || count > 200) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 200." },
        { status: 400 }
      );
    }

    const BATCH_SIZE = 20;
    let allQuestions = [];
    let quizTitle    = "";
    let quizTopic    = "";

    if (count <= BATCH_SIZE) {
      const result = await generateBatch(contentToUse, count, difficulty, language, 1);
      if (!result?.questions?.length) {
        return NextResponse.json({ error: "Could not parse quiz. Please try again." }, { status: 500 });
      }
      allQuestions = result.questions;
      quizTitle    = result.title || "Quiz";
      quizTopic    = result.topic || "";
    } else {
      const batches = [];
      let remaining = count, startId = 1;
      while (remaining > 0) {
        const batchCount = Math.min(BATCH_SIZE, remaining);
        batches.push({ count: batchCount, startId });
        startId   += batchCount;
        remaining -= batchCount;
      }

      for (const b of batches) {
        const result = await generateBatch(contentToUse, b.count, difficulty, language, b.startId);
        if (!result?.questions?.length) continue;
        if (!quizTitle) { quizTitle = result.title || "Quiz"; quizTopic = result.topic || ""; }
        const fixed = result.questions.map((q, i) => ({ ...q, id: b.startId + i }));
        allQuestions.push(...fixed);
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate questions. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: { title: quizTitle, topic: quizTopic, language, questions: allQuestions },
    });

  } catch (err) {
    console.error("Generate error:", err);
    if (err?.status === 429) {
      return NextResponse.json({ error: "Rate limit hit. Please wait a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "Generation failed. Try again." }, { status: 500 });
  }
}