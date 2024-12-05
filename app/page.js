"use client";

import { useState, useRef, useCallback } from "react";
import { DIFFICULTIES, COUNTS, SAMPLES, LETTERS } from "../lib/constants";

// ── Inline Icons ─────────────────────────────────────────────────
const Icons = {
  Feather: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Text: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.7 2 2 .7-2 .7L5 9l-.7-2-2-.7 2-.7z"/><path d="M19 13l.7 2 2 .7-2 .7L19 19l-.7-2-2-.7 2-.7z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
      <polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/>
      <path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/>
    </svg>
  ),
  Redo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Loader: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  GitHub: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  ),
};

// ── Score badge ───────────────────────────────────────────────────
function scoreMeta(pct) {
  if (pct >= 90) return { label: "Outstanding!",  color: "text-sage",  bg: "bg-sage/10"  };
  if (pct >= 70) return { label: "Great job!",    color: "text-amber", bg: "bg-amber/10" };
  if (pct >= 50) return { label: "Keep going!",   color: "text-amber", bg: "bg-amber/10" };
  return           { label: "Keep practising", color: "text-ember", bg: "bg-ember/10" };
}

// ── Results Screen ────────────────────────────────────────────────
function ResultsScreen({ quiz, answers, onRetry, onNew }) {
  const correct = quiz.questions.filter((q) => answers[q.id] === q.answer).length;
  const total   = quiz.questions.length;
  const pct     = Math.round((correct / total) * 100);
  const meta    = scoreMeta(pct);

  return (
    <div className="animate-pop max-w-2xl mx-auto">
      {/* Score card */}
      <div className={`rounded-2xl border border-[var(--border)] p-8 text-center mb-6 ${meta.bg}`}>
        <div className="flex justify-center mb-4 text-[var(--muted)]"><Icons.Trophy /></div>
        <p className="font-serif text-3xl font-bold mb-1 text-[var(--ink)]">{correct} / {total}</p>
        <p className={`text-xl font-serif italic mb-3 ${meta.color}`}>{meta.label}</p>
        <div className="progress-track h-3 w-48 mx-auto mb-3">
          <div className="progress-fill h-3" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-[var(--muted)]">{pct}% correct · {quiz.title}</p>
      </div>

      {/* Question review */}
      <div className="space-y-4 mb-8">
        <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">Review answers</h3>
        {quiz.questions.map((q, i) => {
          const userAns = answers[q.id];
          const isRight = userAns === q.answer;
          return (
            <div key={q.id} className="bg-[var(--paper)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRight ? "bg-sage/15 text-sage" : "bg-ember/15 text-ember"}`}>
                  {isRight ? <Icons.Check /> : <Icons.X />}
                </span>
                <p className="text-sm font-medium text-[var(--ink)]">
                  <span className="font-mono text-[var(--muted)] text-xs mr-2">{String(i + 1).padStart(2, "0")}.</span>
                  {q.question}
                </p>
              </div>
              <div className="ml-9 space-y-1.5">
                {LETTERS.map((l) => (
                  <div
                    key={l}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                      l === q.answer
                        ? "bg-sage/10 text-sage border border-sage/30"
                        : l === userAns && !isRight
                        ? "bg-ember/10 text-ember border border-ember/30"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    <span className="font-mono font-semibold w-4 shrink-0">{l}.</span>
                    <span>{q.options[l]}</span>
                    {l === q.answer && <span className="ml-auto font-semibold">✓ Correct</span>}
                    {l === userAns && !isRight && <span className="ml-auto">Your answer</span>}
                  </div>
                ))}
                <p className="text-xs text-[var(--muted)] italic mt-2 pt-2 border-t border-[var(--border)]">
                  {q.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--ink)] hover:border-[var(--amber)] hover:bg-[#fffbf4] transition-all"
        >
          <Icons.Redo /> Retry quiz
        </button>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors"
        >
          <Icons.Sparkles /> New quiz
        </button>
      </div>
    </div>
  );
}

// ── Quiz Play Screen ──────────────────────────────────────────────
function QuizScreen({ quiz, onFinish }) {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);   // chosen option letter
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState({});

  const q        = quiz.questions[current];
  const total    = quiz.questions.length;
  const progress = ((current) / total) * 100;

  const choose = (letter) => {
    if (revealed) return;
    setSelected(letter);
    setRevealed(true);
    setAnswers((prev) => ({ ...prev, [q.id]: letter }));
  };

  const next = () => {
    if (current + 1 >= total) {
      onFinish({ ...answers, [q.id]: selected });
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const btnClass = (letter) => {
    if (!revealed) return selected === letter ? "option-btn selected" : "option-btn";
    if (letter === q.answer)                      return "option-btn correct";
    if (letter === selected && letter !== q.answer) return "option-btn wrong";
    return "option-btn opacity-50";
  };

  return (
    <div className="max-w-2xl mx-auto animate-rise">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="tag bg-[var(--cream)] text-[var(--muted)]">{quiz.title}</span>
        <span className="text-xs text-[var(--muted)] font-mono">{current + 1} / {total}</span>
      </div>

      {/* Progress */}
      <div className="progress-track h-1.5 mb-6">
        <div className="progress-fill h-1.5" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div key={q.id} className="animate-count mb-6">
        <p className="text-xs text-[var(--muted)] font-mono mb-2">Question {current + 1}</p>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)] leading-relaxed">
          {q.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() => choose(letter)}
            disabled={revealed}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm ${btnClass(letter)}`}
          >
            <span className="w-7 h-7 rounded-lg border border-current/25 flex items-center justify-center font-mono text-xs font-semibold shrink-0 bg-[var(--cream)]">
              {letter}
            </span>
            <span className="flex-1">{q.options[letter]}</span>
            {revealed && letter === q.answer && (
              <span className="text-sage shrink-0"><Icons.Check /></span>
            )}
            {revealed && letter === selected && letter !== q.answer && (
              <span className="text-ember shrink-0"><Icons.X /></span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className="animate-rise bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Explanation</p>
          <p className="text-sm text-[var(--ink)] leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Next */}
      {revealed && (
        <button
          onClick={next}
          className="animate-rise flex items-center gap-2 ml-auto px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors"
        >
          {current + 1 >= total ? "See results" : "Next question"}
          <Icons.ChevronRight />
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Home() {
  const [tab,        setTab]        = useState("text");   // "text" | "image"
  const [text,       setText]       = useState("");
  const [image,      setImage]      = useState(null);     // { base64, mediaType, preview }
  const [difficulty, setDifficulty] = useState("medium");
  const [count,      setCount]      = useState(5);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [quiz,       setQuiz]       = useState(null);
  const [screen,     setScreen]     = useState("input"); // "input" | "quiz" | "results"
  const [finalAns,   setFinalAns]   = useState({});
  const [dragOver,   setDragOver]   = useState(false);

  const fileRef = useRef(null);

  // ── Image handling ─────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64  = dataUrl.split(",")[1];
      setImage({ base64, mediaType: file.type, preview: dataUrl, name: file.name });
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── Generate quiz ──────────────────────────────────────────────
  const generate = async () => {
    if (loading) return;
    if (tab === "text" && !text.trim()) { setError("Please enter some text."); return; }
    if (tab === "image" && !image)      { setError("Please upload an image."); return; }

    setLoading(true); setError(null);
    try {
      const body = {
        text:           tab === "text" ? text : (text || ""),
        imageBase64:    tab === "image" ? image.base64    : undefined,
        imageMediaType: tab === "image" ? image.mediaType : undefined,
        count,
        difficulty,
      };
      const res  = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setQuiz(data.quiz);
      setScreen("quiz");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = (ans) => { setFinalAns(ans); setScreen("results"); };
  const handleRetry  = ()    => { setScreen("quiz"); };
  const handleNew    = ()    => { setQuiz(null); setScreen("input"); setFinalAns({}); };

  // ── Input screen ───────────────────────────────────────────────
  if (screen === "input") return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="text-center mb-10 animate-rise">
          <div className="inline-flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-full px-4 py-1.5 text-xs text-[var(--muted)] mb-4">
            <Icons.Sparkles />
            AI-powered quiz generation
          </div>
          <h1 className="font-serif text-4xl font-bold text-[var(--ink)] mb-2">
            QuizCraft
          </h1>
          <p className="text-[var(--muted)] text-sm">
            Turn any paragraph or image into an intelligent quiz in seconds.
          </p>
        </header>

        <div className="space-y-5 stagger">

          {/* Input type toggle */}
          <div className="bg-[var(--cream)] border border-[var(--border)] rounded-2xl p-1 flex gap-1">
            {[
              { id: "text",  label: "Paste Text",    Icon: Icons.Text  },
              { id: "image", label: "Upload Image",  Icon: Icons.Image },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-[var(--paper)] text-[var(--ink)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* Text input */}
          {tab === "text" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Your Content</label>
                <div className="flex gap-2">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { setText(s.text); setError(null); }}
                      className="text-xs text-[var(--amber)] hover:underline"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setError(null); }}
                placeholder="Paste any paragraph, article excerpt, study notes, or textbook content here…"
                rows={8}
                className="w-full bg-[var(--paper)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] placeholder-[var(--muted)]/60 leading-relaxed"
              />
              <p className="text-xs text-[var(--muted)] mt-1">{text.length} characters</p>
            </div>
          )}

          {/* Image upload */}
          {tab === "image" && (
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 block">Upload Image</label>
              <div
                className={`drop-zone rounded-xl p-8 text-center cursor-pointer ${dragOver ? "drag-over" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                {image ? (
                  <div className="space-y-2">
                    <img src={image.preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                    <p className="text-xs text-[var(--muted)]">{image.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="text-xs text-ember hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="text-[var(--muted)]">
                    <div className="flex justify-center mb-3"><Icons.Upload /></div>
                    <p className="text-sm mb-1">Drop an image here or <span className="text-[var(--amber)]">click to browse</span></p>
                    <p className="text-xs">JPG, PNG, WebP up to 10MB</p>
                    <p className="text-xs mt-2">Works with: textbook pages, handwritten notes, diagrams, screenshots</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

              {/* Optional extra context */}
              {image && (
                <div className="mt-3">
                  <label className="text-xs text-[var(--muted)] mb-1 block">Optional: Add context for better questions</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="E.g. 'This is from chapter 3 of my biology textbook'"
                    rows={2}
                    className="w-full bg-[var(--paper)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--muted)]/60"
                  />
                </div>
              )}
            </div>
          )}

          {/* Settings row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 block">Difficulty</label>
              <div className="flex flex-col gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition-all ${
                      difficulty === d.value
                        ? d.color
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      difficulty === d.value
                        ? d.value === "easy" ? "bg-sage" : d.value === "medium" ? "bg-amber-500" : "bg-ember"
                        : "bg-[var(--border)]"
                    }`} />
                    <span className="font-medium">{d.label}</span>
                    <span className="text-xs ml-auto opacity-70">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 block">Number of Questions</label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`py-3 rounded-xl border font-mono font-semibold text-sm transition-all ${
                      count === n
                        ? "border-[var(--amber)] bg-amber-50 text-amber-700"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-ember/10 border border-ember/30 text-ember text-sm px-4 py-3 rounded-xl animate-rise">
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              loading
                ? "bg-[var(--warm)] text-[var(--muted)] cursor-not-allowed"
                : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2d2010] active:scale-[0.99]"
            }`}
          >
            {loading ? <><Icons.Loader /> Generating quiz…</> : <><Icons.Sparkles /> Generate Quiz</>}
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>QuizCraft · Built with Next.js + Groq API</span>
          <div className="flex items-center gap-3">
            <a href="https://github.com/roshnithakor07/quizcraft" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors">
              <Icons.GitHub /> GitHub
            </a>
            <span>by <a href="https://roshnithakor07.github.io" className="text-[var(--amber)] hover:underline">Roshni Thakor</a></span>
          </div>
        </footer>
      </div>
    </div>
  );

  // ── Quiz screen ────────────────────────────────────────────────
  if (screen === "quiz") return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</h1>
          <button onClick={handleNew} className="text-xs text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--amber)] transition-all">
            ← New quiz
          </button>
        </div>
        <QuizScreen quiz={quiz} onFinish={handleFinish} />
      </div>
    </div>
  );

  // ── Results screen ─────────────────────────────────────────────
  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</h1>
        </div>
        <ResultsScreen quiz={quiz} answers={finalAns} onRetry={handleRetry} onNew={handleNew} />
      </div>
    </div>
  );
}
