"use client";

import { useState, useEffect } from "react";

const Icons = {
  Loader:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Copy:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Check:    ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
  Trophy:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/></svg>,
};

function scoreColor(pct) {
  if (pct>=80) return "#4d7c5f";
  if (pct>=60) return "#d97706";
  if (pct>=40) return "#ea8c2a";
  return "#c2410c";
}

export default function ResultsDashboard({ params }) {
  const { id } = params;
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(()=>{
    fetch(`/api/results/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if(!d.success) setError(d.error||"Not found");
        else setData(d);
      })
      .catch(()=>setError("Failed to load results."))
      .finally(()=>setLoading(false));
  },[id]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><Icons.Loader/><p className="text-sm text-[var(--muted)] mt-3">Loading results…</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-ember font-semibold mb-2">Not found</p>
        <p className="text-sm text-[var(--muted)]">{error}</p>
        <a href="/" className="mt-4 inline-block text-sm text-[var(--amber)] hover:underline">← Create a quiz</a>
      </div>
    </div>
  );

  const { quiz, responses } = data;
  const avg = responses.length
    ? Math.round(responses.reduce((s,r)=>s+r.percentage,0)/responses.length)
    : 0;
  const best = responses.length ? Math.max(...responses.map(r=>r.percentage)) : 0;
  const quizUrl = `${window.location.origin}/quiz/${id}`;

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[var(--muted)] font-mono mb-1">Results Dashboard</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--ink)] mb-1">{quiz.title}</h1>
          <p className="text-sm text-[var(--muted)]">{quiz.topic}</p>
        </div>

        {/* Share link */}
        <div className="card mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Share Link</p>
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-3 py-2.5">
            <span className="text-xs text-[var(--ink)] font-mono flex-1 truncate">{quizUrl}</span>
            <button onClick={copyLink} className="shrink-0 text-xs text-[var(--amber)] hover:underline flex items-center gap-1">
              {copied?<><Icons.Check/>Copied!</>:<><Icons.Copy/>Copy</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {label:"Total Attempts", value:responses.length, color:"text-[var(--ink)]"},
            {label:"Avg Score",      value:responses.length?`${avg}%`:"—",  color:responses.length?`text-[${scoreColor(avg)}]`:"text-[var(--muted)]"},
            {label:"Best Score",     value:responses.length?`${best}%`:"—", color:"text-sage"},
            {label:"Questions",      value:quiz.questions.length, color:"text-[var(--ink)]"},
          ].map(({label,value})=>(
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
            <span className="text-xs text-[var(--muted)] bg-[var(--cream)] border border-[var(--border)] px-2 py-1 rounded-full">{responses.length} total</span>
          </div>

          {responses.length===0?(
            <div className="text-center py-12">
              <p className="text-[var(--muted)] text-sm mb-1">No responses yet</p>
              <p className="text-xs text-[var(--muted)]">Share the quiz link to start collecting responses</p>
            </div>
          ):(
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-4 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-3 pb-2 border-b border-[var(--border)]">
                <div>Name</div>
                <div className="text-center">Score</div>
                <div className="text-center">%</div>
                <div className="text-right">Submitted</div>
              </div>
              {responses.map((r,i)=>{
                const c = scoreColor(r.percentage);
                const time = new Date(r.submittedAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
                return(
                  <div key={i} className="grid grid-cols-4 items-center px-3 py-3 rounded-xl hover:bg-[var(--cream)] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{background:c}}>
                        {r.takerName[0].toUpperCase()}
                      </span>
                      <span className="text-sm text-[var(--ink)] font-medium truncate">{r.takerName}</span>
                    </div>
                    <div className="text-center">
                      <span className="font-mono text-sm font-semibold" style={{color:c}}>{r.score}/{r.total}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:`${c}18`,color:c}}>{r.percentage}%</span>
                    </div>
                    <div className="text-right text-xs text-[var(--muted)]">{time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-[var(--amber)] hover:underline">← Create a new quiz</a>
        </div>
      </div>
    </div>
  );
}