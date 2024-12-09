"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { DIFFICULTIES, COUNTS, LETTERS, LANGUAGES } from "../lib/constants";

// ── Icons ─────────────────────────────────────────────────────────
const Icons = {
  Feather:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>,
  Sparkles:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M5 3l.7 2 2 .7-2 .7L5 9l-.7-2-2-.7 2-.7z"/><path d="M19 13l.7 2 2 .7-2 .7L19 19l-.7-2-2-.7 2-.7z"/></svg>,
  Check:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>,
  X:            ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trophy:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0z"/><path d="M5 4H2v3a3 3 0 0 0 3 3M19 4h3v3a3 3 0 0 1-3 3"/></svg>,
  Redo:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  ChevronRight: ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6"/></svg>,
  Loader:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Share:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Download:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Copy:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  BarChart:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  Globe:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  GitHub:       ()=><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>,
};

// ── Export Dropdown (click-outside + Escape aware) ────────────────
function ExportDropdown({ quiz }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey   = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown",   onKey);
    };
  }, [open]);

  // Always close when quiz object changes (navigation)
  useEffect(() => { setOpen(false); }, [quiz]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-[var(--muted)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--amber)] transition-all">
        <Icons.Download /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[var(--paper)] border border-[var(--border)] rounded-xl shadow-xl z-50 min-w-[180px] overflow-hidden">
          {[
            ["📄 PDF (no answers)",  () => exportPDF(quiz, false)],
            ["📄 PDF + answer key",  () => exportPDF(quiz, true)],
            ["📝 Word (no answers)", () => exportWord(quiz, false)],
            ["📝 Word + answer key", () => exportWord(quiz, true)],
          ].map(([label, fn]) => (
            <button key={label} onClick={() => { fn(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-[var(--ink)] hover:bg-[var(--cream)] transition-colors border-b border-[var(--border)] last:border-0">
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Language Dropdown with search ────────────────────────────────
const ALL_LANGUAGES = [
  {value:"English",    flag:"🇬🇧"}, {value:"Hindi",      flag:"🇮🇳"},
  {value:"Spanish",    flag:"🇪🇸"}, {value:"French",     flag:"🇫🇷"},
  {value:"German",     flag:"🇩🇪"}, {value:"Portuguese", flag:"🇧🇷"},
  {value:"Arabic",     flag:"🇸🇦"}, {value:"Japanese",   flag:"🇯🇵"},
  {value:"Chinese",    flag:"🇨🇳"}, {value:"Korean",     flag:"🇰🇷"},
  {value:"Italian",    flag:"🇮🇹"}, {value:"Russian",    flag:"🇷🇺"},
  {value:"Turkish",    flag:"🇹🇷"}, {value:"Dutch",      flag:"🇳🇱"},
  {value:"Thai",       flag:"🇹🇭"}, {value:"Vietnamese", flag:"🇻🇳"},
  {value:"Bengali",    flag:"🇧🇩"}, {value:"Urdu",       flag:"🇵🇰"},
  {value:"Swahili",    flag:"🇰🇪"}, {value:"Polish",     flag:"🇵🇱"},
  {value:"Gujarati",   flag:"🇮🇳"}, {value:"Marathi",    flag:"🇮🇳"},
  {value:"Tamil",      flag:"🇮🇳"}, {value:"Telugu",     flag:"🇮🇳"},
];

function LanguagePicker({ value, onChange }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); }};
    const onKey   = (e) => { if (e.key === "Escape") { setOpen(false); setSearch(""); }};
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown",   onKey);
    return () => { document.removeEventListener("mousedown", onMouse); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const filtered = ALL_LANGUAGES.filter(l =>
    l.value.toLowerCase().includes(search.toLowerCase())
  );
  const selected = ALL_LANGUAGES.find(l => l.value === value);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
          open ? "border-[var(--amber)] bg-[var(--cream)]" : "border-[var(--border)] bg-[var(--paper)] hover:border-[var(--amber)]"
        }`}>
        <span className="flex items-center gap-2">
          <span className="text-base">{selected?.flag}</span>
          <span className="text-[var(--ink)] font-medium">{selected?.value}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-[var(--muted)] transition-transform ${open?"rotate-180":""}`}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--paper)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[var(--border)]">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search language…"
              className="w-full px-3 py-2 text-sm bg-[var(--cream)] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--amber)] text-[var(--ink)] placeholder-[var(--muted)]/50"/>
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">No language found</p>
            ) : filtered.map(l => (
              <button key={l.value} onClick={() => { onChange(l.value); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  l.value === value
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "text-[var(--ink)] hover:bg-[var(--cream)]"
                }`}>
                <span className="text-base">{l.flag}</span>
                <span>{l.value}</span>
                {l.value === value && <span className="ml-auto text-amber-500">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function scoreMeta(pct) {
  if (pct >= 90) return { label:"Outstanding!",   color:"text-sage",  bg:"bg-sage/10"  };
  if (pct >= 70) return { label:"Great job!",     color:"text-amber", bg:"bg-amber/10" };
  if (pct >= 50) return { label:"Keep going!",    color:"text-amber", bg:"bg-amber/10" };
  return           { label:"Keep practising", color:"text-ember", bg:"bg-ember/10" };
}

// ── PDF Export ────────────────────────────────────────────────────
async function exportPDF(quiz, showAnswers = false) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  const W = 210, margin = 15, lineW = W - margin * 2;
  let y = margin;

  const addText = (text, size, bold, color=[0,0,0]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text), lineW);
    if (y + lines.length * (size * 0.4) > 285) { doc.addPage(); y = margin; }
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4) + 2;
  };

  // Title
  addText(quiz.title, 18, true);
  addText(quiz.topic, 11, false, [100,100,100]);
  addText(`${quiz.questions.length} questions · ${quiz.language || "English"}${showAnswers ? " · With Answer Key" : ""}`, 10, false, [150,150,150]);
  y += 4;

  quiz.questions.forEach((q, i) => {
    if (y > 260) { doc.addPage(); y = margin; }
    addText(`${i + 1}. ${q.question}`, 11, true);
    ["A","B","C","D"].forEach(l => {
      const isAns = showAnswers && l === q.answer;
      addText(`  ${l}. ${q.options[l]}`, 10, isAns, isAns ? [0,120,60] : [50,50,50]);
    });
    if (showAnswers) {
      addText(`   ✓ Answer: ${q.answer}  |  ${q.explanation}`, 9, false, [0,100,60]);
    }
    y += 3;
  });

  doc.save(`${quiz.title.replace(/\s+/g,"-")}.pdf`);
}

// ── Word Export ───────────────────────────────────────────────────
async function exportWord(quiz, showAnswers = false) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const children = [
    new Paragraph({ text: quiz.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ children:[new TextRun({ text: quiz.topic, color:"666666", italics:true })] }),
    new Paragraph({ children:[new TextRun({ text:`${quiz.questions.length} questions · ${quiz.language||"English"}`, color:"999999", size:20 })] }),
    new Paragraph({ text:"" }),
  ];

  quiz.questions.forEach((q, i) => {
    children.push(new Paragraph({ children:[new TextRun({ text:`${i+1}. ${q.question}`, bold:true, size:24 })] }));
    ["A","B","C","D"].forEach(l => {
      const isAns = showAnswers && l === q.answer;
      children.push(new Paragraph({ children:[new TextRun({ text:`   ${l}. ${q.options[l]}`, color: isAns ? "007A3D" : "333333", bold: isAns })] }));
    });
    if (showAnswers) {
      children.push(new Paragraph({ children:[new TextRun({ text:`   ✓ ${q.answer}: ${q.explanation}`, color:"007A3D", italics:true })] }));
    }
    children.push(new Paragraph({ text:"" }));
  });

  const doc = new Document({ sections:[{ children }] });
  const blob = await Packer.toBlob(doc);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `${quiz.title.replace(/\s+/g,"-")}.docx`; a.click();
  URL.revokeObjectURL(url);
}

// ── Share modal ───────────────────────────────────────────────────
function ShareModal({ shareId, quizTitle, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/quiz/${shareId}`;
  const resultsUrl = `${window.location.origin}/results/${shareId}`;

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--paper)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e=>e.stopPropagation()}>
        <h3 className="font-serif text-xl font-bold text-[var(--ink)] mb-1">Quiz shared! 🎉</h3>
        <p className="text-sm text-[var(--muted)] mb-5">Share this link with anyone to take "{quizTitle}"</p>

        {/* Quiz link */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Quiz Link</p>
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-3 py-2.5">
            <span className="text-xs text-[var(--ink)] font-mono flex-1 truncate">{url}</span>
            <button onClick={()=>copy(url)} className="shrink-0 text-xs text-[var(--amber)] hover:underline flex items-center gap-1">
              {copied ? <><Icons.Check/>Copied!</> : <><Icons.Copy/>Copy</>}
            </button>
          </div>
        </div>

        {/* Results link */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">Results Dashboard (for you)</p>
          <div className="flex items-center gap-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-3 py-2.5">
            <span className="text-xs text-[var(--ink)] font-mono flex-1 truncate">{resultsUrl}</span>
            <button onClick={()=>copy(resultsUrl)} className="shrink-0 text-xs text-[var(--amber)] hover:underline flex items-center gap-1">
              <Icons.Copy/>Copy
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-1.5">Save this link — it shows everyone who took the quiz and their scores</p>
        </div>

        <div className="flex gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium text-center hover:bg-[#2d2010] transition-colors">
            Open quiz →
          </a>
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:border-[var(--amber)] transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────
function ResultsScreen({ quiz, answers, onRetry, onNew }) {
  const correct = quiz.questions.filter(q=>answers[q.id]===q.answer).length;
  const total   = quiz.questions.length;
  const pct     = Math.round((correct/total)*100);
  const meta    = scoreMeta(pct);

  return (
    <div className="animate-pop max-w-2xl mx-auto">
      <div className={`rounded-2xl border border-[var(--border)] p-8 text-center mb-6 ${meta.bg}`}>
        <div className="flex justify-center mb-4 text-[var(--muted)]"><Icons.Trophy/></div>
        <p className="font-serif text-3xl font-bold mb-1 text-[var(--ink)]">{correct} / {total}</p>
        <p className={`text-xl font-serif italic mb-3 ${meta.color}`}>{meta.label}</p>
        <div className="progress-track h-3 w-48 mx-auto mb-3">
          <div className="progress-fill h-3" style={{width:`${pct}%`}}/>
        </div>
        <p className="text-sm text-[var(--muted)]">{pct}% correct · {quiz.title}</p>
      </div>

      {/* Export */}
      <div className="flex gap-2 mb-5">
        <ExportDropdown quiz={quiz}/>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">Review answers</h3>
        {quiz.questions.map((q,i)=>{
          const userAns=answers[q.id], isRight=userAns===q.answer;
          return(
            <div key={q.id} className="bg-[var(--paper)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRight?"bg-sage/15 text-sage":"bg-ember/15 text-ember"}`}>
                  {isRight?<Icons.Check/>:<Icons.X/>}
                </span>
                <p className="text-sm font-medium text-[var(--ink)]">
                  <span className="font-mono text-[var(--muted)] text-xs mr-2">{String(i+1).padStart(2,"0")}.</span>
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

      <div className="flex gap-3">
        <button onClick={onRetry} className="flex items-center gap-2 px-5 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--ink)] hover:border-[var(--amber)] hover:bg-[#fffbf4] transition-all">
          <Icons.Redo/>Retry quiz
        </button>
        <button onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors">
          <Icons.Sparkles/>New quiz
        </button>
      </div>
    </div>
  );
}

// ── Quiz Play Screen ──────────────────────────────────────────────
function QuizScreen({ quiz, onFinish }) {
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState({});

  const q        = quiz.questions[current];
  const total    = quiz.questions.length;
  const progress = (current/total)*100;

  const choose = (letter) => {
    if (revealed) return;
    setSelected(letter);
    setRevealed(true);
    setAnswers(prev=>({...prev,[q.id]:letter}));
  };

  const next = () => {
    if (current+1>=total) onFinish({...answers,[q.id]:selected});
    else { setCurrent(c=>c+1); setSelected(null); setRevealed(false); }
  };

  const btnClass = (letter) => {
    if (!revealed) return selected===letter?"option-btn selected":"option-btn";
    if (letter===q.answer)                       return "option-btn correct";
    if (letter===selected&&letter!==q.answer)    return "option-btn wrong";
    return "option-btn opacity-50";
  };

  return (
    <div className="max-w-2xl mx-auto animate-rise">
      <div className="flex items-center justify-between mb-2">
        <span className="tag bg-[var(--cream)] text-[var(--muted)]">{quiz.title}</span>
        <span className="text-xs text-[var(--muted)] font-mono">{current+1} / {total}</span>
      </div>
      <div className="progress-track h-1.5 mb-6">
        <div className="progress-fill h-1.5" style={{width:`${progress}%`}}/>
      </div>
      <div key={q.id} className="animate-count mb-6">
        <p className="text-xs text-[var(--muted)] font-mono mb-2">Question {current+1}</p>
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)] leading-relaxed">{q.question}</h2>
      </div>
      <div className="space-y-2.5 mb-6">
        {LETTERS.map(letter=>(
          <button key={letter} onClick={()=>choose(letter)} disabled={revealed}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm ${btnClass(letter)}`}>
            <span className="w-7 h-7 rounded-lg border border-current/25 flex items-center justify-center font-mono text-xs font-semibold shrink-0 bg-[var(--cream)]">{letter}</span>
            <span className="flex-1">{q.options[letter]}</span>
            {revealed&&letter===q.answer&&<span className="text-sage shrink-0"><Icons.Check/></span>}
            {revealed&&letter===selected&&letter!==q.answer&&<span className="text-ember shrink-0"><Icons.X/></span>}
          </button>
        ))}
      </div>
      {revealed&&(
        <div className="animate-rise bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-6">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">Explanation</p>
          <p className="text-sm text-[var(--ink)] leading-relaxed">{q.explanation}</p>
        </div>
      )}
      {revealed&&(
        <button onClick={next} className="animate-rise flex items-center gap-2 ml-auto px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl text-sm font-medium hover:bg-[#2d2010] transition-colors">
          {current+1>=total?"See results":"Next question"}<Icons.ChevronRight/>
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Home() {
  const { data: session } = useSession();

  // ── Restore pending quiz after login ──────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    try {
      const pending = sessionStorage.getItem("pendingQuiz");
      if (!pending) return;
      sessionStorage.removeItem("pendingQuiz");
      const pendingQuiz = JSON.parse(pending);
      // Save it to DB under their account
      fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz: pendingQuiz }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setQuiz(pendingQuiz);
            setShareId(data.shareId);
            setAutoSaved(true);
            setScreen("quiz");
          }
        })
        .catch(console.error);
    } catch {}
  }, [session?.user?.id]);
  const [text,         setText]         = useState("");
  const [tab,          setTab]          = useState("text"); // text | image
  const [image,        setImage]        = useState(null);   // { base64, mediaType, preview, name }
  const [dragOver,     setDragOver]     = useState(false);
  const [difficulties, setDifficulties] = useState(["medium"]);
  const [count,        setCount]        = useState(10);
  const [useCustom,    setUseCustom]    = useState(false);
  const [customCount,  setCustomCount]  = useState("");
  const [language,     setLanguage]     = useState("English");
  const [loading,      setLoading]      = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState("");
  const [error,        setError]        = useState(null);
  const [quiz,         setQuiz]         = useState(null);
  const [screen,       setScreen]       = useState("input");
  const [finalAns,     setFinalAns]     = useState({});
  const [shareId,      setShareId]      = useState(null);
  const [sharing,      setSharing]      = useState(false);
  const [showShare,    setShowShare]    = useState(false);
  const [autoSaved,    setAutoSaved]    = useState(false); // tracks if quiz was auto-saved

  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImage({ base64: dataUrl.split(",")[1], mediaType: file.type, preview: dataUrl, name: file.name });
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  const toggleDifficulty = (val) => {
    setDifficulties(prev=>
      prev.includes(val)
        ? prev.length===1 ? prev : prev.filter(d=>d!==val)
        : [...prev,val]
    );
    setError(null);
  };

  const finalCount = useCustom
    ? Math.min(Math.max(parseInt(customCount)||5, 1), 200)
    : count;

  // ── Generate ───────────────────────────────────────────────────
  const generate = async () => {
    if (loading) return;
    if (tab === "text") {
      if (!text.trim())            { setError("Please paste some text first."); return; }
      if (text.trim().length < 50) { setError("Text too short — paste at least 50 characters."); return; }
    }
    if (tab === "image" && !image) { setError("Please upload an image first."); return; }
    if (useCustom && (!customCount || parseInt(customCount)<1 || parseInt(customCount)>200)) {
      setError("Custom count must be between 1 and 200."); return;
    }

    setLoading(true); setError(null);
    const batchMsg = finalCount > 40
      ? `Generating ${finalCount} questions in batches — this takes ~${Math.ceil(finalCount/40)*8}s…`
      : "Generating quiz…";
    setLoadingMsg(batchMsg);

    try {
      const res  = await fetch("/api/generate", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          text:           tab === "text" ? text : "",
          imageBase64:    tab === "image" ? image.base64     : undefined,
          imageMediaType: tab === "image" ? image.mediaType  : undefined,
          count: finalCount, difficulty: difficulties.join(", "), language,
        }),
      });
      const data = await res.json();
      if (!res.ok||!data.success) throw new Error(data.error||"Failed");

      const generatedQuiz = data.quiz;
      setQuiz(generatedQuiz);
      setScreen("quiz");
      setShareId(null);
      setAutoSaved(false);

      // ── Auto-save ONLY if logged in ──────────────────────────────
      if (session) {
        try {
          const saveRes  = await fetch("/api/quiz", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz: generatedQuiz }),
          });
          const saveData = await saveRes.json();
          if (saveData.success) {
            setShareId(saveData.shareId);
            setAutoSaved(true);
          }
        } catch (saveErr) {
          console.error("Auto-save failed:", saveErr);
        }
      }
      // Guest → quiz lives in memory only, banner will warn them
    } catch(e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  };

  // ── Share ──────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!quiz) return;

    // Already saved → just open modal
    if (shareId) { setShowShare(true); return; }

    // Guest → store quiz in sessionStorage, redirect to login
    if (!session) {
      try { sessionStorage.setItem("pendingQuiz", JSON.stringify(quiz)); } catch {}
      window.location.href = "/login?pending=quiz";
      return;
    }

    // Logged in but not saved yet (fallback)
    setSharing(true);
    try {
      const res  = await fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShareId(data.shareId);
      setAutoSaved(true);
      setShowShare(true);
    } catch(e) { alert("Failed to save quiz: " + e.message); }
    finally { setSharing(false); }
  };

  const handleFinish  = (ans) => { setFinalAns(ans); setScreen("results"); };
  const handleRetry   = ()    => { setFinalAns({}); setScreen("quiz"); };
  const handleNew     = ()    => { setQuiz(null); setScreen("input"); setShareId(null); setAutoSaved(false); };

  // ── Input screen ───────────────────────────────────────────────
  if (screen==="input") return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[var(--amber)]">
            <Icons.Feather/>
            <span className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</span>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link href="/dashboard"
                  className="text-xs px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)] transition-all">
                  My quizzes
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-red-300 hover:text-red-500 transition-all">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="text-xs px-3 py-2 border border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)] transition-all">
                  Sign in
                </Link>
                <Link href="/register"
                  className="text-xs px-3 py-2 bg-[var(--ink)] text-[var(--paper)] rounded-xl hover:bg-[#2d2010] transition-all">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="text-center mb-8">
          <p className="text-sm text-[var(--muted)]">Paste any text → AI generates a quiz · Share with anyone · Export PDF or Word</p>
        </div>

        <div className="card space-y-6">

          {/* ── Tab toggle ── */}
          <div className="flex gap-1 bg-[var(--cream)] border border-[var(--border)] rounded-xl p-1">
            <button onClick={()=>{setTab("text");setError(null);}}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab==="text"?"bg-[var(--paper)] text-[var(--ink)] shadow-sm border border-[var(--border)]":"text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              Text / Notes
            </button>
            <button onClick={()=>{setTab("image");setError(null);}}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab==="image"?"bg-[var(--paper)] text-[var(--ink)] shadow-sm border border-[var(--border)]":"text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Image / Photo
            </button>
          </div>

          {/* ── TEXT TAB ── */}
          {tab==="text" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Your Content</label>
                {text && (
                  <button onClick={()=>{setText("");setError(null);}}
                    className="text-[10px] text-ember hover:underline flex items-center gap-1">
                    <Icons.X/> Clear
                  </button>
                )}
              </div>
              {/* Sample topics */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { label:"🌌 Black Holes",      text:"A black hole is a region of spacetime where gravity is so strong that nothing, not even light or other electromagnetic waves, has enough speed to escape it. The boundary of no escape is called the event horizon. Black holes form when massive stars collapse at the end of their life cycle. Stephen Hawking predicted that black holes emit radiation due to quantum effects near the event horizon, now known as Hawking radiation. Supermassive black holes are found at the center of most galaxies, including our Milky Way." },
                  { label:"🐍 Python Basics",    text:"Python is a high-level, interpreted programming language known for its simplicity and readability. It uses indentation to define code blocks. Python supports multiple programming paradigms including procedural, object-oriented, and functional programming. Key features include dynamic typing, automatic memory management, and a vast standard library. Python uses lists, tuples, dictionaries, and sets as core data structures. Functions are defined with the def keyword. Classes are defined with the class keyword and support inheritance." },
                  { label:"⚔️ World War II",     text:"World War II lasted from 1939 to 1945 and involved most of the world's nations. It was sparked by Nazi Germany's invasion of Poland. The Allied Powers included Britain, France, the Soviet Union, and the United States, while the Axis Powers included Germany, Italy, and Japan. Key events include the Battle of Britain, the siege of Stalingrad, D-Day on June 6 1944, and the dropping of atomic bombs on Hiroshima and Nagasaki. The war ended with Germany's surrender in May 1945 and Japan's surrender in September 1945." },
                  { label:"🌿 Photosynthesis",   text:"Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose. It occurs in the chloroplasts using chlorophyll. The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle occurs in the stroma and uses ATP and NADPH to fix carbon dioxide into glucose. The overall equation is: 6CO2 + 6H2O + light energy produces C6H12O6 + 6O2." },
                  { label:"🤖 Machine Learning", text:"Machine learning is a subset of artificial intelligence where systems learn from data without being explicitly programmed. Types include supervised learning where labeled data is used, unsupervised learning where patterns are found in unlabeled data, and reinforcement learning where agents learn through rewards. Key algorithms include linear regression, decision trees, random forests, support vector machines, and neural networks. Overfitting occurs when a model performs well on training data but poorly on new data. Cross-validation helps evaluate model performance." },
                ].map(s=>(
                  <button key={s.label} onClick={()=>{setText(s.text);setError(null);}}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)] hover:bg-[var(--cream)] transition-all">
                    {s.label}
                  </button>
                ))}
              </div>
              <textarea value={text} onChange={e=>{setText(e.target.value);setError(null);}} rows={6}
                placeholder="Paste your notes, textbook excerpt, article, or any text here… or click a sample above ↑"
                className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] placeholder-[var(--muted)]/40 resize-y leading-relaxed transition-colors min-h-[120px]"/>
              <p className="text-[10px] text-[var(--muted)] mt-1">{text.length} chars</p>
            </div>
          )}

          {/* ── IMAGE TAB ── */}
          {tab==="image" && (
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 block">Upload Image</label>

              {/* Info banner */}
              <div className="flex items-start gap-3 bg-[var(--cream)] border border-[var(--border)] rounded-xl px-4 py-3 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Upload a textbook page, notes, or slide — we'll read the text and generate your quiz.
                  <span className="text-[var(--ink)] font-medium"> Best with clear, readable text.</span>
                </p>
              </div>

              {/* Upload zone */}
              {!image ? (
                <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
                  onClick={()=>fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver?"border-[var(--amber)] bg-amber-50":"border-[var(--border)] hover:border-[var(--amber)] hover:bg-[var(--cream)]"}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 text-[var(--muted)]"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  <p className="text-sm font-medium text-[var(--ink)] mb-1">Drop image here or click to browse</p>
                  <p className="text-xs text-[var(--muted)]">JPG, PNG, WEBP — textbooks, notes, slides</p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
                </div>
              ) : (
                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <img src={image.preview} alt="uploaded" className="w-full max-h-48 object-cover"/>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--cream)]">
                    <span className="text-xs text-[var(--muted)] truncate">{image.name}</span>
                    <button onClick={()=>{setImage(null);setError(null);}} className="text-xs text-ember hover:underline shrink-0 ml-2">Remove</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Language */}
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Icons.Globe/>Quiz Language</label>
            <LanguagePicker value={language} onChange={setLanguage}/>
          </div>

          {/* Difficulty */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Difficulty</label>
              <span className="text-[10px] text-[var(--muted)] bg-[var(--cream)] border border-[var(--border)] px-2 py-0.5 rounded-full">multi-select</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {DIFFICULTIES.map(d=>{
                const isActive=difficulties.includes(d.value);
                const dotColor=d.value==="easy"?"#4d7c5f":d.value==="medium"?"#d97706":"#c2410c";
                const bgColor=d.value==="easy"?"rgba(77,124,95,0.08)":d.value==="medium"?"rgba(217,119,6,0.08)":"rgba(194,65,12,0.08)";
                const borderColor=d.value==="easy"?"rgba(77,124,95,0.4)":d.value==="medium"?"rgba(217,119,6,0.4)":"rgba(194,65,12,0.4)";
                return(
                  <button key={d.value} onClick={()=>toggleDifficulty(d.value)}
                    style={isActive?{background:bgColor,borderColor,color:dotColor}:{}}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all ${isActive?"font-medium":"border-[var(--border)] text-[var(--muted)] hover:bg-[var(--cream)]"}`}>
                    <span className="w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all"
                      style={isActive?{background:dotColor,borderColor:dotColor}:{borderColor:"var(--border)"}}>
                      {isActive&&<svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5"><polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </span>
                    <span>{d.label}</span>
                    <span className="text-xs ml-auto opacity-60">{d.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Questions</label>
              <button onClick={()=>{setUseCustom(v=>!v);setError(null);}} className="text-[10px] text-[var(--amber)] hover:underline">
                {useCustom?"use preset":"custom (up to 200)"}
              </button>
            </div>
            {useCustom?(
              <div className="relative">
                <input type="number" min="1" max="200" value={customCount}
                  onChange={e=>{setCustomCount(e.target.value);setError(null);}}
                  placeholder="1 – 200"
                  className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-mono font-semibold text-[var(--ink)] bg-[var(--paper)] outline-none focus:border-[var(--amber)] placeholder-[var(--muted)]/40 text-center"/>
                <p className="text-[10px] text-[var(--muted)] text-center mt-1.5">
                  {parseInt(customCount)>40?"⚡ Large batches take longer — ~{Math.ceil((parseInt(customCount)||0)/40)*8}s":"Enter 1–200 questions"}
                </p>
              </div>
            ):(
              <div className="grid grid-cols-4 gap-2">
                {[5,10,20,50].map(n=>(
                  <button key={n} onClick={()=>{setCount(n);setError(null);}}
                    className={`py-3 rounded-xl border font-mono font-semibold text-sm transition-all ${
                      count===n?"border-[var(--amber)] bg-amber-50 text-amber-700":"border-[var(--border)] text-[var(--muted)] hover:border-[var(--amber)] hover:bg-[var(--cream)]"
                    }`}>{n}</button>
                ))}
              </div>
            )}
            <div className="mt-3 px-3 py-2 bg-[var(--cream)] border border-[var(--border)] rounded-xl">
              <p className="text-[11px] text-[var(--muted)] text-center">
                <span className="font-semibold text-[var(--ink)]">{finalCount} questions</span>
                {" · "}
                <span className="font-semibold text-[var(--ink)] capitalize">{difficulties.join(" + ")}</span>
                {" · "}
                <span className="font-semibold text-[var(--ink)]">{language}</span>
              </p>
            </div>
          </div>

          {error&&<div className="bg-ember/10 border border-ember/30 text-ember text-sm px-4 py-3 rounded-xl">{error}</div>}

          <button onClick={generate} disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              loading?"bg-[var(--warm)] text-[var(--muted)] cursor-not-allowed":"bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2d2010] active:scale-[0.99]"
            }`}>
            {loading?<><Icons.Loader/>{loadingMsg}</>:<><Icons.Sparkles/>Generate Quiz</>}
          </button>
        </div>

        <footer className="mt-10 pt-6 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>QuizCraft · Next.js + Groq AI</span>
          <span>by <a href="https://roshnithakor07.github.io" className="text-[var(--amber)] hover:underline">Roshni Thakor</a></span>
        </footer>
      </div>
    </div>
  );

  // ── Quiz screen ────────────────────────────────────────────────
  if (screen==="quiz") return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Guest warning banner */}
        {!session && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">This quiz will be lost if you close this tab.</span>{" "}
                Sign in to save it to your account permanently.
              </p>
            </div>
            <button
              onClick={() => {
                try { sessionStorage.setItem("pendingQuiz", JSON.stringify(quiz)); } catch {}
                window.location.href = "/login?pending=quiz";
              }}
              className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all shrink-0 whitespace-nowrap">
              Save my quiz
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</h1>
          <div className="flex items-center gap-2">
            <ExportDropdown quiz={quiz}/>
            <button onClick={handleShare} disabled={sharing}
              className="flex items-center gap-1.5 text-xs text-[var(--amber)] border border-[var(--amber)]/40 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all">
              {sharing ? <Icons.Loader/> : <Icons.Share/>}
              {sharing ? "Saving…" : "Share"}
            </button>
            <button onClick={handleNew} className="text-xs text-[var(--muted)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:border-[var(--amber)] transition-all">
              ← New quiz
            </button>
          </div>
        </div>
        <QuizScreen quiz={quiz} onFinish={handleFinish}/>
      </div>
      {showShare&&shareId&&<ShareModal shareId={shareId} quizTitle={quiz.title} onClose={()=>setShowShare(false)}/>}
    </div>
  );

  // ── Results screen ─────────────────────────────────────────────
  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Guest warning banner */}
        {!session && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-xs text-amber-700 leading-relaxed">
                <span className="font-semibold">Your quiz will be lost when you close this tab.</span>{" "}
                Create a free account to save quizzes, share them, and track responses.
              </p>
            </div>
            <button
              onClick={() => {
                try { sessionStorage.setItem("pendingQuiz", JSON.stringify(quiz)); } catch {}
                window.location.href = "/register?pending=quiz";
              }}
              className="text-xs font-semibold text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all shrink-0 whitespace-nowrap">
              Save free
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">QuizCraft</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} disabled={sharing}
              className="flex items-center gap-1.5 text-xs text-[var(--amber)] border border-[var(--amber)]/40 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all">
              {sharing?<Icons.Loader/>:<Icons.Share/>}
              {sharing ? "Saving…" : "Share quiz"}
            </button>
          </div>
        </div>
        <ResultsScreen quiz={quiz} answers={finalAns} onRetry={handleRetry} onNew={handleNew}/>
      </div>
      {showShare&&shareId&&<ShareModal shareId={shareId} quizTitle={quiz.title} onClose={()=>setShowShare(false)}/>}
    </div>
  );
}