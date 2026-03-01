import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Club Obsidian — The Obsidian Gate",
  description: "An AI-powered social engineering game. There is one door. One man. Can you talk your way past him?",
  keywords: ["AI game", "social engineering", "LLM game", "ChatGPT game", "Club Obsidian", "The Obsidian Gate"],
  authors: [{ name: "Hassan" }],
  openGraph: {
    title: "The Obsidian Gate | Club Obsidian",
    description: "An AI-powered social engineering simulator. Use only your words to convince the Doorman to let you in.",
    url: "https://obsidian-gate.vercel.app", // Adjust to your actual Vercel URL later
    siteName: "The Obsidian Gate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Obsidian Gate | Club Obsidian",
    description: "An AI-powered social engineering simulator. Use only your words to convince the Doorman to let you in.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${cormorantGaramond.variable} ${inter.variable} font-sans antialiased bg-zinc-950 text-fafafa`}
      >
        {children}
      </body>
    </html>
  );
}
