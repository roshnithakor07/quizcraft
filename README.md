# 🧠 QuizCraft — AI Quiz Generator from Text & Images

> Transform any paragraph, article, textbook page, or image into a fully interactive multiple-choice quiz — powered by Claude AI.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Claude API](https://img.shields.io/badge/Claude-Vision+Text-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📸 Features at a Glance

```
Input modes:   📝 Paste Text   |   🖼️ Upload Image (vision AI)
Difficulty:    🟢 Easy  🟡 Medium  🔴 Hard
Questions:     3 · 5 · 7 · 10
Output:        Interactive MCQ quiz → Score → Review with explanations
```

---

## ✨ What It Does

1. **Paste any text** — article, study notes, textbook excerpt
2. **Or upload an image** — textbook page, handwritten notes, diagram, screenshot
3. **Choose difficulty** (Easy / Medium / Hard) and number of questions
4. **Get a full MCQ quiz** with 4 options per question
5. **Play the quiz** with instant feedback and explanations
6. **Review your score** with per-question breakdown

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Styling     | Tailwind CSS                        |
| AI Engine   | Anthropic Claude API (Text + Vision)|
| Fonts       | Playfair Display, DM Sans, DM Mono  |
| Deployment  | Vercel                              |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18.17.0`
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com/)

### Installation

```bash
# Clone
git clone https://github.com/roshnithakor07/quizcraft.git
cd quizcraft

# Install
npm install

# Configure
cp .env.example .env.local
# → Add your ANTHROPIC_API_KEY in .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
quizcraft/
│
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.js      # Claude API — quiz generation
│   ├── globals.css           # Warm editorial theme
│   ├── layout.js             # Root layout + metadata
│   └── page.js               # Full UI (input → quiz → results)
│
├── lib/
│   └── constants.js          # Difficulties, counts, sample texts
│
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔌 API Reference

### `POST /api/generate`

Generates a quiz from text or image content.

**Request Body**

```json
{
  "text": "Paste your paragraph or article here...",
  "imageBase64": "base64-encoded-image-string",
  "imageMediaType": "image/jpeg",
  "count": 5,
  "difficulty": "medium"
}
```

> `text` or `imageBase64` is required. Both can be provided together.

**Response**

```json
{
  "success": true,
  "quiz": {
    "title": "Black Holes in Space",
    "topic": "Physics of black holes and event horizons",
    "questions": [
      {
        "id": 1,
        "question": "What is the boundary beyond which nothing can escape a black hole?",
        "options": {
          "A": "Schwarzschild radius",
          "B": "Event horizon",
          "C": "Photon sphere",
          "D": "Singularity"
        },
        "answer": "B",
        "explanation": "The event horizon is the boundary of no escape. The Schwarzschild radius defines its size, but the horizon itself is the actual boundary."
      }
    ]
  }
}
```

**Parameters**

| Field           | Type    | Required | Values                                    |
|-----------------|---------|----------|-------------------------------------------|
| `text`          | string  | Partial  | Any paragraph (min ~50 words recommended) |
| `imageBase64`   | string  | Partial  | Base64-encoded image data                 |
| `imageMediaType`| string  | No       | `image/jpeg`, `image/png`, `image/webp`   |
| `count`         | number  | Yes      | `3`, `5`, `7`, `10`                       |
| `difficulty`    | string  | Yes      | `easy`, `medium`, `hard`                  |

---

## 🎯 Use Cases

- **Students** — Quickly create practice quizzes from lecture notes or textbook pages
- **Teachers** — Generate quiz drafts from lesson material in seconds
- **Self-learners** — Test comprehension of any article or blog post
- **Developers** — Learn how to build Claude Vision + Text AI apps

---

## ⚙️ Environment Variables

| Variable            | Required | Description                   |
|---------------------|----------|-------------------------------|
| `ANTHROPIC_API_KEY` | ✅ Yes   | Your Anthropic Claude API key |

---

## 🚢 Deployment

### Vercel (one command)

```bash
npm i -g vercel
vercel
# Set ANTHROPIC_API_KEY in Vercel dashboard → Settings → Environment Variables
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/roshnithakor07/quizcraft)

---

## 🗺️ Roadmap

- [ ] **PDF support** — Upload a PDF and generate quiz from any page
- [ ] **Quiz history** — MongoDB + user accounts to save quizzes
- [ ] **Share quiz** — Unique shareable link for each quiz
- [ ] **Export** — Download quiz as PDF or CSV
- [ ] **Timed mode** — Countdown timer per question
- [ ] **Leaderboard** — Share your score with a link
- [ ] **Multiple languages** — Generate quizzes in Hindi, Gujarati, etc.

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Roshni Thakor** — Backend Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-roshnithakor07.github.io-orange?style=flat-square)](https://roshnithakor07.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-roshnithakor07-black?style=flat-square&logo=github)](https://github.com/roshnithakor07)

---

*Built to make learning more interactive — one quiz at a time.*
