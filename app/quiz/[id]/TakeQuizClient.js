"use client";

import { useState } from "react";
import { LETTERS } from "../../../lib/constants";

const Icons = {
  Check:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
  X:            ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronRight: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronLeft:  ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>,
  Trophy:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/></svg>,
  Redo:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

const MAX_RETRIES   = 2;
const REVIEW_PAGE_SIZE = 10;

function scoreMeta(pct) {
  if (pct>=90) return {label:"Outstanding!",  color:"#4d7c5f"};
  if (pct>=70) return {label:"Great job!",    color:"#d97706"};
  if (pct>=50) return {label:"Keep going!",   color:"#d97706"};
  return          {label:"Keep practising", color:"#c2410c"};
}

export default function TakeQuizClient({ quiz, shareId }) {
  const [screen,     setScreen]     = useState("name");
  const [name,       setName]       = useState("");
  const [current,    setCurrent]    = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [revealed,   setRevealed]   = useState(false);
  const [answers,    setAnswers]    = useState({});
  const [score,      setScore]      = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [reviewPage, setReviewPage] = useState(0); // pagination for review

  const totalQuestions = quiz.questions.length;
  const totalPages     = Math.ceil(totalQuestions / REVIEW_PAGE_SIZE);

  const startQuiz = () => { if (!name.trim()) return; setScreen("quiz"); };

  const choose = (letter) => {
    if (revealed) return;
    const q = quiz.questions[current];
    setSelected(letter);
    setRevealed(true);
    setAnswers(prev => ({ ...prev, [q.id]: letter }));
  };

  const next = async () => {
    const q          = quiz.questions[current];
    const newAnswers = { ...answers, [q.id]: selected };

    if (current + 1 >= totalQuestions) {
      setSubmitting(true);
      try {
        const res  = await fetch("/api/submit", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shareId, takerName: name, answers: newAnswers, questions: quiz.questions }),
        });
        const data = await res.json();
        if (data.success) setScore(data);
      } catch {}
      finally { setSubmitting(false); }
      setAnswers(newAnswers);
      setScreen("results");
      setReviewPage(0);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) return;
    setRetryCount(c => c + 1);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers({});
    setScore(null);
    setReviewPage(0);
    setScreen("quiz");
  };

  const btnClass = (letter) => {
    const q = quiz.questions[current];
    if (!revealed) return "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm border border-[var(--border)] bg-[var(--paper)] hover:border-[var(--amber)] hover:bg-[var(--cream)] transition-all cursor-pointer";
    if (letter === q.answer) return "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm border bg-sage/10 border-sage/40 text-sage";
    if (letter === selected && letter !== q.answer) return "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm border bg-ember/10 border-ember/40 text-ember";
    return "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm border border-[var(--border)] text-[var(--muted)] opacity-50";
  };

  // ── Name screen ──────────────────────────────────────────────
  if (screen === "name") return (
    <div className="min-h-screen relative z-10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-mono mb-2">QuizCraft</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--ink)] mb-2">{quiz.title}</h1>
          <p className="text-sm text-[var(--muted)] mb-1">{quiz.topic}</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="bg-[var(--cream)] border border-[var(--border)] px-2.5 py-1 rounded-full text-xs text-[var(--muted)]">{totalQuestions} questions</span>
            <span className="bg-[var(--cream)] border border-[var(--border)] px-2.5 py-1 rounded-full text-xs text-[var(--muted)]">{quiz.language||"English"}</span>
          </div>
        </div>
        <div className="card">
          <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 block">Your Name</label>
          <input value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&startQuiz()}
            placeholder="Enter your name…"
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] mb-4 transition-colors"/>
          <button onClick={startQuiz} disabled={!name.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2d2010] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Quiz screen ──────────────────────────────────────────────
  if (screen === "quiz") {
    const q        = quiz.questions[current];
    const progress = (current / totalQuestions) * 100;
    return (
      <div className="min-h-screen relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted)] font-mono">Hi, {name} 👋</span>
            <span className="text-xs text-[var(--muted)] font-mono">{current+1} / {totalQuestions}</span>
          </div>
          <div className="h-1.5 bg-[var(--cream)] rounded-full mb-6">
            <div className="h-1.5 bg-[var(--amber)] rounded-full transition-all duration-300" style={{width:`${progress}%`}}/>
          </div>
          <div className="mb-6">
            <p className="text-xs text-[var(--muted)] font-mono mb-2">Question {current+1}</p>
            <h2 className="font-serif text-xl font-semibold text-[var(--ink)] leading-relaxed">{q.question}</h2>
          </div>
          <div className="space-y-2.5 mb-6">
            {LETTERS.map(letter=>(
              <button key={letter} onClick={()=>choose(letter)} disabled={revealed} className={btnClass(letter)}>
                <span className="w-7 h-7 rounded-lg border border-current/25 flex items-center justify-center font-mono text-xs font-semibold shrink-0">{letter}</span>
                <span className="flex-1">{q.options[letter]}</span>
                {revealed&&letter===q.answer&&<Icons.Check/>}
                {revealed&&letter===selected&&letter!==q.answer&&<Icons.X/>}
              </button>
            ))}
          </div>
          {revealed&&(
            <div className="bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-6">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Explanation</p>
              <p className="text-sm text-[var(--ink)] leading-relaxed">{q.explanation}</p>
            </div>
          )}
          {revealed&&(
            <button onClick={next} disabled={submitting}
              className="flex items-center gap-2 ml-auto px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors disabled:opacity-60">
              {submitting?"Submitting…":current+1>=totalQuestions?"See results":"Next question"}
              <Icons.ChevronRight/>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results screen ───────────────────────────────────────────
  const correct = score?.score ?? quiz.questions.filter(q=>answers[q.id]===q.answer).length;
  const pct     = score?.percentage ?? Math.round((correct/totalQuestions)*100);
  const meta    = scoreMeta(pct);

  // Pagination
  const pageStart    = reviewPage * REVIEW_PAGE_SIZE;
  const pageEnd      = Math.min(pageStart + REVIEW_PAGE_SIZE, totalQuestions);
  const pagedQuestions = quiz.questions.slice(pageStart, pageEnd);

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Score card */}
        <div className="card text-center mb-6" style={{background:`${meta.color}10`,borderColor:`${meta.color}30`}}>
          <div className="flex justify-center mb-4 text-[var(--muted)]"><Icons.Trophy/></div>
          <p className="font-serif text-3xl font-bold mb-1 text-[var(--ink)]">{correct} / {totalQuestions}</p>
          <p className="text-xl font-serif italic mb-3" style={{color:meta.color}}>{meta.label}</p>
          <div className="h-3 w-48 mx-auto rounded-full bg-[var(--cream)] mb-3">
            <div className="h-3 rounded-full transition-all" style={{width:`${pct}%`,background:meta.color}}/>
          </div>
          <p className="text-sm text-[var(--muted)]">{pct}% correct · {name}</p>
        </div>

        {/* Retry button */}
        <div className="flex items-center gap-3 mb-6">
          {retryCount < MAX_RETRIES ? (
            <button onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--ink)] hover:border-[var(--amber)] hover:bg-[#fffbf4] transition-all">
              <Icons.Redo/> Retry quiz
              <span className="text-xs text-[var(--muted)]">({MAX_RETRIES - retryCount} left)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] cursor-not-allowed opacity-50">
              <Icons.Redo/> No retries left
            </div>
          )}
          <a href="/" className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors">
            Create your own →
          </a>
        </div>

        {/* Review answers — paginated */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">
            Review answers
            {totalPages > 1 && <span className="text-sm text-[var(--muted)] font-sans font-normal ml-2">
              (showing {pageStart+1}–{pageEnd} of {totalQuestions})
            </span>}
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          {pagedQuestions.map((q,i)=>{
            const userAns = answers[q.id];
            const isRight = userAns === q.answer;
            const qNum    = pageStart + i;
            return (
              <div key={q.id} className="bg-[var(--paper)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRight?"bg-sage/15 text-sage":"bg-ember/15 text-ember"}`}>
                    {isRight?"✓":"✗"}
                  </span>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    <span className="font-mono text-[var(--muted)] text-xs mr-2">{String(qNum+1).padStart(2,"0")}.</span>
                    {q.question}
                  </p>
                </div>
                <div className="ml-9 space-y-1.5">
                  {LETTERS.map(l=>(
                    <div key={l} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                      l===q.answer?"bg-sage/10 text-sage border border-sage/30":
                      l===userAns&&!isRight?"bg-ember/10 text-ember border border-ember/30":
                      "text-[var(--muted)]"}`}>
                      <span className="font-mono font-semibold w-4 shrink-0">{l}.</span>
                      <span>{q.options[l]}</span>
                      {l===q.answer&&<span className="ml-auto font-semibold">✓ Correct</span>}
                      {l===userAns&&!isRight&&<span className="ml-auto">Your answer</span>}
                    </div>
                  ))}
                  <p className="text-xs text-[var(--muted)] italic mt-2 pt-2 border-t border-[var(--border)]">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <button onClick={()=>setReviewPage(p=>Math.max(0,p-1))} disabled={reviewPage===0}
              className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:border-[var(--amber)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <Icons.ChevronLeft/> Previous
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({length:totalPages},(_,i)=>(
                <button key={i} onClick={()=>setReviewPage(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all ${
                    reviewPage===i
                      ? "bg-[var(--ink)] text-[var(--paper)]"
                      : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)]"
                  }`}>{i+1}</button>
              ))}
            </div>
            <button onClick={()=>setReviewPage(p=>Math.min(totalPages-1,p+1))} disabled={reviewPage===totalPages-1}
              className="flex items-center gap-1.5 px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:border-[var(--amber)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next <Icons.ChevronRight/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}