import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

export const metadata = {
  title: "Shiksha AI — Voice Teaching Assistant",
  description:
    "AI-powered voice teaching assistant for Haryana government schools. Hands-free concept explanations and interactive quizzes in Hindi, English, and Hinglish.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A0103" />
      </head>
      <body style={{ cursor: "none" }}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
