import "./globals.css";
import { Providers } from "./providers";
import ThemeToggle from "./ThemeToggle";

const APP_URL = process.env.NEXTAUTH_URL || "https://quizcraft-mauve.vercel.app";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "QuizCraft — AI Quiz Generator",
    template: "%s — QuizCraft",
  },
  description:
    "Generate quizzes from any text using AI. Paste notes, articles or textbook pages → get instant multiple-choice questions. Export PDF, share with anyone, track responses.",
  keywords: [
    "quiz generator", "AI quiz", "MCQ generator", "multiple choice questions",
    "quiz maker", "study tool", "exam prep", "quiz from text", "Groq AI",
  ],
  authors: [{ name: "Roshni Thakor", url: "https://roshnithakor07.github.io" }],
  creator: "Roshni Thakor",
  openGraph: {
    type:        "website",
    url:         APP_URL,
    title:       "QuizCraft — AI Quiz Generator",
    description: "Generate quizzes from any text using AI. Export PDF, share with anyone, track responses.",
    siteName:    "QuizCraft",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "QuizCraft — AI Quiz Generator",
    description: "Generate quizzes from any text using AI.",
    creator:     "@roshnithakor07",
  },
  icons: {
    icon:  [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  );
}