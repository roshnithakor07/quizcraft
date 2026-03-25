# 📝 QuizCraft — AI Quiz Generator

> Generate quizzes from any text using AI · Share with anyone via link · Export PDF or Word · Track responses with a results dashboard.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![NextAuth](https://img.shields.io/badge/NextAuth.js-v4-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Features

### Quiz Generation
- **Text input** — Paste notes, articles, textbook excerpts
- **Image upload** — Upload textbook pages or slides (best with clear text)
- **Up to 200 questions** — Auto-batches API calls for large quizzes
- **24 languages** — English, Hindi, Spanish, French, Arabic, Japanese, Gujarati and more
- **Multi-difficulty** — Easy / Medium / Hard (mix-and-match)
- **Sample topics** — One-click Black Holes, Python, WW2, Photosynthesis, ML

### Export
- **PDF (no answers)** — Clean printable quiz
- **PDF + answer key** — Correct answers highlighted in green
- **Word (no answers)** — .docx for easy editing
- **Word + answer key** — .docx with answers marked

### Share & Collaborate
- **Shareable link** — `/quiz/[id]` — anyone can take without signing up
- **Public quiz page** — Name entry → take quiz → instant score + review
- **Results dashboard** — `/results/[id]` — see all responses, scores, timestamps
- **Copy quiz link** — One click to clipboard

### Authentication
- **Email + password signup/login** — via NextAuth.js + bcryptjs
- **My Quizzes dashboard** — all your created quizzes in one place
- **Response stats** — total responses + avg score per quiz
- **Delete quiz** — removes quiz + all responses
- **Guest mode** — generate and take quizzes without signing up; sign in required to share

### UX
- **Searchable language dropdown** — 24 languages, type to filter
- **Resizable textarea** — drag to expand content area
- **Clear button** — one click to clear content
- **Export close on Escape** — dropdown closes on Escape or click-outside

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Auth        | NextAuth.js v4 + bcryptjs           |
| AI Engine   | Groq API — LLaMA 3.3 70B Versatile  |
| Database    | MongoDB Atlas                        |
| Styling     | Tailwind CSS                         |
| Export      | jsPDF + docx                         |
| Runtime     | Node.js ≥ 18                         |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18`
- MongoDB Atlas account (free tier) → [mongodb.com/atlas](https://mongodb.com/atlas)
- Groq API key (free) → [console.groq.com](https://console.groq.com)

### Installation

```bash
git clone https://github.com/roshnithakor07/quizcraft.git
cd quizcraft
npm install
cp .env.example .env.local
```

### Environment Variables

```env
# .env.local
GROQ_API_KEY=gsk_your_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quizcraft?retryWrites=true&w=majority
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
quizcraft/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js   ← NextAuth handler
│   │   │   └── register/route.js        ← Signup endpoint
│   │   ├── generate/route.js            ← Quiz generation (Groq, batching)
│   │   ├── quiz/
│   │   │   ├── route.js                 ← POST save quiz
│   │   │   └── [id]/route.js            ← GET quiz + DELETE quiz
│   │   ├── submit/route.js              ← Submit answers + save score
│   │   └── results/[id]/route.js        ← GET all responses for a quiz
│   │
│   ├── quiz/[id]/
│   │   ├── page.js                      ← Server component (fast load)
│   │   └── TakeQuizClient.js            ← Client quiz UI
│   │
│   ├── results/[id]/
│   │   ├── page.js                      ← Server component (auth protected)
│   │   └── ResultsClient.js             ← Results dashboard UI
│   │
│   ├── dashboard/
│   │   ├── page.js                      ← My quizzes (server, auth required)
│   │   └── DashboardClient.js           ← Dashboard UI
│   │
│   ├── login/page.js                    ← Login page
│   ├── register/page.js                 ← Signup page
│   ├── providers.js                     ← SessionProvider wrapper
│   ├── layout.js                        ← Root layout
│   ├── globals.css
│   └── page.js                          ← Home / generate page
│
├── lib/
│   ├── mongodb.js                       ← DB connection
│   ├── auth.js                          ← NextAuth config
│   └── constants.js                     ← Languages, difficulties, samples
│
├── .env.example
├── package.json
└── README.md
```

---

## 🗄️ MongoDB Collections

```
Database: quizcraft

quizzes collection:
  shareId, creatorId, creatorName, title, topic,
  language, questions[], createdAt, expiresAt

responses collection:
  shareId, takerName, answers{}, score,
  total, percentage, submittedAt

users collection:
  name, email, password (hashed), createdAt
```

---

## 🔌 API Reference

### `POST /api/generate` — Generate quiz
```json
{ "text": "...", "count": 10, "difficulty": "medium", "language": "English" }
```

### `POST /api/quiz` — Save quiz (requires auth to link to account)
```json
{ "quiz": { "title": "...", "questions": [...] } }
```

### `GET /api/quiz/[id]` — Get quiz by shareId

### `DELETE /api/quiz/[id]` — Delete quiz (creator only)

### `POST /api/submit` — Submit answers
```json
{ "shareId": "...", "takerName": "Roshni", "answers": {}, "questions": [...] }
```

### `GET /api/results/[id]` — Get all responses (creator only)

### `POST /api/auth/register` — Create account
```json
{ "name": "Roshni", "email": "...", "password": "..." }
```

---

## 🚢 Deployment (Vercel)

```bash
npm i -g vercel && vercel
```

Set these in Vercel → Settings → Environment Variables:
```
GROQ_API_KEY
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL  ← your production URL e.g. https://quizcraft.vercel.app
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/roshnithakor07/quizcraft)

---

## ✅ Completed Features

- [x] AI quiz generation from text (Groq LLaMA 3.3 70B)
- [x] Up to 200 questions with auto-batching
- [x] 24 languages with searchable dropdown
- [x] Multi-difficulty selection
- [x] Export PDF + Word (with/without answer key)
- [x] Shareable quiz link
- [x] Public quiz-taking page (no login needed)
- [x] Response tracking + results dashboard
- [x] Email/password auth (NextAuth + bcryptjs)
- [x] My Quizzes dashboard
- [x] Delete quiz
- [x] Server-side rendering for fast page loads
- [x] Image upload tab (with text extraction note)
- [x] Sample topic chips
- [x] Resizable content textarea

## 🔮 Roadmap

- [ ] Google OAuth login
- [ ] Quiz timer / time limit mode
- [ ] PDF/image OCR (with OpenAI GPT-4o or Claude)
- [ ] Quiz categories / tags
- [ ] Public quiz discovery page
- [ ] Leaderboard per quiz

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 👩‍💻 Author

**Roshni Thakor** — Backend Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-roshnithakor07.github.io-purple?style=flat-square)](https://roshnithakor07.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-roshnithakor07-black?style=flat-square&logo=github)](https://github.com/roshnithakor07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-roshnithakor07-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/roshnithakor07)

---

*Built to solve a real problem: creating and sharing quizzes from your own study material — fast.*