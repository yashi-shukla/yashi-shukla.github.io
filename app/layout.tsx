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

const siteUrl = "https://yashi-shukla.github.io";
const title = "Yashi Shukla - Data Engineer & AI Specialist";
const description =
  "Empowering positive change through data, AI & cloud engineering. 5+ years building scalable solutions for governments, nonprofits, and enterprises worldwide.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "data engineer",
    "AI specialist",
    "machine learning",
    "cloud solutions",
    "LLM",
    "GenAI",
    "portfolio",
    "Yashi Shukla",
  ],
  creator: "Yashi Shukla",
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Yashi Shukla",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
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
            <main className="flex flex-col min-h-screen w-full">
              {children}
            </main>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
