import { NextResponse } from "next/server";

// ── Helpers ──────────────────────────────────────────────────────

function isYouTubeUrl(url) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
}

function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([^&\s]+)/,
    /youtu\.be\/([^?&\s]+)/,
    /youtube\.com\/shorts\/([^?&\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<(script|style|nav|header|footer|aside|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

// ── Transcript cleaner ────────────────────────────────────────────
// Removes meta noise: intros, sponsor segments, course/instructor mentions,
// subscribe calls-to-action, timestamps, and filler phrases.
// This ensures the AI generates questions about CONCEPTS, not meta content.
function cleanTranscript(rawText) {
  const lines = rawText.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);

  // Patterns that indicate a meta/noise sentence — not educational content
  const noisePatterns = [
    // Instructor / course self-reference
    /my name is/i,
    /i('m| am) your instructor/i,
    /i('m| am) [a-z]+ and (i|we)/i,
    /welcome to (this|the|my|our)/i,
    /welcome back/i,
    /in this (video|tutorial|course|lesson|series)/i,
    /by the end of this/i,
    /throughout this (video|course|tutorial)/i,
    /in this section/i,
    /what (you'?ll|we'?ll|we will|you will) (learn|cover|build|create|make|do) (in )?today/i,
    /what (you'?ll|we'?ll) (learn|cover|build|create|make)/i,
    /we('re| are) going to (learn|cover|build|look at|explore|talk about)/i,
    /i('m| am) going to (show|teach|walk|take)/i,
    /let me (show|introduce|walk|take)/i,
    /at the end of (this|the) (video|tutorial|course)/i,
    /by the time (you finish|we('re| are) done)/i,

    // Project meta references
    /the project (we|you|i)/i,
    /the app (we|you|i)/i,
    /what (we|you|i)('re|'ll| will| are) build(ing)?/i,
    /we('re| are) (going to |gonna )?(build|create|make) (a |an )/i,

    // Subscribe / like / comment CTAs
    /subscribe/i,
    /hit the (bell|like|notification)/i,
    /click the (bell|like)/i,
    /leave a (comment|like)/i,
    /comment (below|down)/i,
    /like (and|&) subscribe/i,
    /share this video/i,
    /notification(s)? (on|bell)/i,

    // Sponsor / promo
    /this (video|tutorial) is sponsored/i,
    /sponsored by/i,
    /check out our (website|course|platform)/i,
    /use (the )?code/i,
    /discount code/i,
    /coupon/i,
    /sign up (for|at|on)/i,
    /link in (the )?(description|bio)/i,
    /link (below|down)/i,
    /free (trial|access|course)/i,
    /promo/i,

    // Filler / meta commentary
    /so (without|with that said|let('s| us) (get|jump|dive))/i,
    /alright[,.]?\s*(so|let)/i,
    /okay[,.]?\s*(so|let)/i,
    /let('s| us) (get|jump|dive) (started|right in|in)/i,
    /let('s| us) go ahead/i,
    /go ahead and/i,
    /as (you can see|we can see|i mentioned)/i,
    /if you (have any|enjoyed|like)/i,
    /hope (you|this) (enjoyed|helped|was useful)/i,
    /thanks? for watching/i,
    /see you (in the next|next time)/i,
    /that('s| is) it for (today|this video|this one)/i,
    /in the next (video|part|episode)/i,
    /that('s| is) (all|everything) (for now|for today)/i,
    /you can find (the |this )?(code|source|repo|files)/i,
    /source code/i,
    /github (repo|link|repository)/i,
    /download(able)? (files?|code|resources?)/i,

    // Timestamps / chapter markers
    /^\d{1,2}:\d{2}/,
    /chapter \d/i,
    /part \d/i,
    /section \d/i,
    /module \d/i,

    // Very short or meaningless fragments
  ].map(p => p); // keep as array for clarity

  const cleaned = lines.filter(line => {
    // Drop very short lines (< 8 words) — usually filler or stubs
    const wordCount = line.split(/\s+/).length;
    if (wordCount < 6) return false;

    // Drop if matches any noise pattern
    for (const pattern of noisePatterns) {
      if (pattern.test(line)) return false;
    }

    return true;
  });

  // Rejoin and collapse whitespace
  const result = cleaned.join(". ").replace(/\.\s*\./g, ".").replace(/\s{2,}/g, " ").trim();

  return result;
}

// ── YouTube handler ───────────────────────────────────────────────

async function fetchYouTubeTranscript(videoId) {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  if (!segments || segments.length === 0) {
    throw new Error(
      "No transcript available for this video. It may be disabled or not in a supported language."
    );
  }

  const rawText = segments
    .map((s) => s.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  // Clean meta noise before returning
  const cleaned = cleanTranscript(rawText);

  if (cleaned.length < 100) {
    throw new Error(
      "This video's transcript is mostly introductory or meta content. Try a more content-heavy tutorial."
    );
  }

  return cleaned;
}

// ── Website handler ───────────────────────────────────────────────

async function fetchWebsiteText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; QuizCraft/1.0; +https://quizcraft.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(
      `Could not fetch that page (HTTP ${res.status}). Make sure the URL is public and reachable.`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error(
      "That URL doesn't point to a readable web page (it may be a PDF, video, or download link)."
    );
  }

  const html = await res.text();
  const text = stripHtml(html);

  if (text.length < 100) {
    throw new Error(
      "Could not extract enough readable text from that page. Try a different URL."
    );
  }

  return text;
}

// ── Route handler ─────────────────────────────────────────────────

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { url } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Please provide a URL." }, { status: 400 });
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return NextResponse.json({ error: "URL cannot be empty." }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return NextResponse.json(
      { error: "Please enter a full URL starting with https:// or http://" },
      { status: 400 }
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return NextResponse.json(
      { error: "That doesn't look like a valid URL." },
      { status: 400 }
    );
  }

  // Block localhost / private IPs (security)
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local")
  ) {
    return NextResponse.json(
      { error: "Private/local URLs are not allowed." },
      { status: 400 }
    );
  }

  try {
    if (isYouTubeUrl(trimmed)) {
      const videoId = extractYouTubeId(trimmed);
      if (!videoId) {
        return NextResponse.json(
          { error: "Could not extract video ID from that YouTube URL." },
          { status: 400 }
        );
      }
      const text = await fetchYouTubeTranscript(videoId);
      return NextResponse.json({
        success: true,
        type: "youtube",
        text,
        charCount: text.length,
        message: `Transcript loaded and cleaned (${text.length.toLocaleString()} characters of content)`,
      });
    } else {
      const text = await fetchWebsiteText(trimmed);
      return NextResponse.json({
        success: true,
        type: "website",
        text,
        charCount: text.length,
        message: `Page content extracted (${text.length.toLocaleString()} characters)`,
      });
    }
  } catch (err) {
    console.error("[fetch-content]", err);

    const msg = err.message || "";
    if (msg.includes("transcript") || msg.includes("Transcript")) {
      return NextResponse.json({ error: msg }, { status: 422 });
    }
    if (
      msg.includes("fetch") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("ECONNREFUSED")
    ) {
      return NextResponse.json(
        {
          error:
            "Could not reach that URL. Check it's publicly accessible and try again.",
        },
        { status: 422 }
      );
    }
    if (msg.includes("timed out") || msg.includes("AbortError")) {
      return NextResponse.json(
        { error: "That page took too long to load. Try a different URL." },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { error: msg || "Failed to fetch content. Try a different URL." },
      { status: 500 }
    );
  }
}