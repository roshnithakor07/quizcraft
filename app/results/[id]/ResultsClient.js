"use client";

import { useState, useEffect } from "react";

function scoreColor(pct) {
  if (pct >= 80) return "#4d7c5f";
  if (pct >= 60) return "#d97706";
  if (pct >= 40) return "#ea8c2a";
  return "#c2410c";
}

// ── User Response Modal ───────────────────────────────────────────
function ResponseModal({ response, quiz, onClose }) {
  const LETTERS = ["A","B","C","D"];
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--paper)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={e=>e.stopPropagation()}>
        <div className="sticky top-0 bg-[var(--paper)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-serif font-bold text-[var(--ink)]">{response.takerName}</p>
            <p className="text-xs text-[var(--muted)]">
              {response.score}/{response.total} correct · {response.percentage}%
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--cream)] transition-all">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          {quiz.questions.map((q, i) => {
            const userAns = response.answers?.[q.id];
            const isRight = userAns === q.answer;
            return (
              <div key={q.id} className="border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isRight?"bg-sage/15 text-sage":"bg-ember/15 text-ember"}`}>
                    {isRight ? "✓" : "✗"}
                  </span>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    <span className="font-mono text-[var(--muted)] text-xs mr-2">{String(i+1).padStart(2,"0")}.</span>
                    {q.question}
                  </p>
                </div>
                <div className="ml-9 space-y-1.5">
                  {LETTERS.map(l => (
                    <div key={l} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                      l===q.answer ? "bg-sage/10 text-sage border border-sage/30" :
                      l===userAns&&!isRight ? "bg-ember/10 text-ember border border-ember/30" :
                      "text-[var(--muted)]"}`}>
                      <span className="font-mono font-semibold w-4 shrink-0">{l}.</span>
                      <span>{q.options[l]}</span>
                      {l===q.answer && <span className="ml-auto font-semibold">✓ Correct</span>}
                      {l===userAns&&!isRight && <span className="ml-auto">Their answer</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ResultsClient({ quiz, responses, shareId }) {
  const [copied,       setCopied]       = useState(false);
  const [origin,       setOrigin]       = useState("");
  const [viewResponse, setViewResponse] = useState(null); // response to show in modal

  // Fix hydration — only use window.location on client
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${origin}/quiz/${shareId}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const avg  = responses.length ? Math.round(responses.reduce((s,r)=>s+r.percentage,0)/responses.length) : 0;
  const best = responses.length ? Math.max(...responses.map(r=>r.percentage)) : 0;

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-[var(--muted)] font-mono mb-1">Results Dashboard</p>
            <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">{quiz.title}</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">{quiz.topic}</p>
          </div>
          <a href="/dashboard" className="text-xs border border-[var(--border)] px-3 py-2 rounded-xl text-[var(--muted)] hover:border-[var(--amber)] transition-all">
            ← My quizzes
          </a>
        </div>

        {/* Share link */}
        <div className="card mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Share Link</p>
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-3 py-2.5">
            <span className="text-xs text-[var(--ink)] font-mono flex-1 truncate">
              {origin ? `${origin}/quiz/${shareId}` : `/quiz/${shareId}`}
            </span>
            <button onClick={copyLink}
              className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                copied
                  ? "bg-sage/15 text-sage border border-sage/30"
                  : "text-[var(--amber)] hover:bg-[var(--cream)] border border-transparent hover:border-[var(--amber)]/30"
              }`}>
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label:"Total Attempts", value: responses.length },
            { label:"Avg Score",      value: responses.length ? `${avg}%`  : "—" },
            { label:"Best Score",     value: responses.length ? `${best}%` : "—" },
            { label:"Questions",      value: quiz.questions.length },
          ].map(({label,value}) => (
            <div key={label} className="card text-center py-4">
              <p className="font-serif text-2xl font-bold text-[var(--ink)]">{value}</p>
              <p className="text-[10px] text-[var(--muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Responses table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Responses</h2>
            <span className="text-xs bg-[var(--cream)] border border-[var(--border)] px-2.5 py-1 rounded-full text-[var(--muted)]">
              {responses.length} total
            </span>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--muted)] text-sm mb-1">No responses yet</p>
              <p className="text-xs text-[var(--muted)]">Share the quiz link to start collecting responses</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-5 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-3 pb-2 border-b border-[var(--border)]">
                <div className="col-span-2">Name</div>
                <div className="text-center">Score</div>
                <div className="text-center">%</div>
                <div className="text-right">Submitted</div>
              </div>
              {responses.map((r,i) => {
                const c    = scoreColor(r.percentage);
                const time = new Date(r.submittedAt).toLocaleString("en-GB",{
                  day:"numeric", month:"short", hour:"2-digit", minute:"2-digit",
                });
                return (
                  <div key={i}
                    className="grid grid-cols-5 items-center px-3 py-3 rounded-xl hover:bg-[var(--cream)] transition-colors cursor-pointer group"
                    onClick={() => setViewResponse(r)}
                    title="Click to view answers">
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{background:c}}>
                        {r.takerName?.[0]?.toUpperCase()||"?"}
                      </span>
                      <div>
                        <span className="text-sm text-[var(--ink)] font-medium">{r.takerName}</span>
                        <p className="text-[10px] text-[var(--muted)] group-hover:text-[var(--amber)] transition-colors">View answers →</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-sm font-semibold" style={{color:c}}>{r.score}/{r.total}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{background:`${c}18`,color:c}}>{r.percentage}%</span>
                    </div>
                    <div className="text-right text-xs text-[var(--muted)]">{time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View response modal */}
      {viewResponse && (
        <ResponseModal
          response={viewResponse}
          quiz={quiz}
          onClose={() => setViewResponse(null)}
        />
      )}
    </div>
  );
}