import "./globals.css";

export const metadata = {
  title: "QuizCraft — AI Quiz Generator",
  description: "Generate intelligent quizzes from any paragraph or image using AI. Supports MCQ with difficulty levels.",
  keywords: ["quiz", "AI", "learning", "MCQ", "generator"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
