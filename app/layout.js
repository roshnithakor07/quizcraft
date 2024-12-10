import "./globals.css";
import { Providers } from "./providers";

const APP_URL = process.env.NEXTAUTH_URL || "https://quizcraft-mauve.vercel.app";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "QuizCraft — AI Quiz Generator", template: "%s — QuizCraft" },
  description: "Generate quizzes from any text using AI. Paste notes, articles or textbook pages → get instant multiple-choice questions. Export PDF, share with anyone, track responses.",
  keywords: ["quiz generator","AI quiz","MCQ generator","multiple choice questions","quiz maker","study tool"],
  authors: [{ name: "Roshni Thakor", url: "https://roshnithakor07.github.io" }],
  creator: "Roshni Thakor",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Apply dark mode BEFORE first paint — eliminates flicker completely */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('qc-dark')==='1'){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}