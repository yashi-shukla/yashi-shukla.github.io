import "./globals.css";
import localFont from "next/font/local";
import { Inter, Instrument_Serif, Playfair_Display } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SmoothScroll } from "@/components/SmoothScroll";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Add elegant serif for headings (like Cyd Stumpel)
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

// Display serif for name/branding
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

// Clean sans-serif for body
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yashi Shukla - Data Engineer & AI Specialist",
  description: "Empowering positive change through data, AI & cloud engineering. 5+ years building scalable solutions for governments, nonprofits, and enterprises worldwide.",
  keywords: ["data engineer", "AI specialist", "machine learning", "cloud solutions", "LLM", "GenAI", "portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${playfairDisplay.variable} ${inter.variable} antialiased font-sans`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <div className="flex flex-col min-h-screen w-full">
              {children}
            </div>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
