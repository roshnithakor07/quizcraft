import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "QuizCraft — AI Quiz Generator",
  description: "Generate quizzes from any text using AI. Share with anyone, export PDF or Word, track responses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}