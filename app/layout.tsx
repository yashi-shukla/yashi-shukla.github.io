import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

export const metadata: Metadata = {
  title: "Yashi Shukla - Data Engineer & Analytics Professional",
  description: "Empowering positive change through data & analytics. Transforming raw data into actionable insights that drive meaningful impact and sustainable solutions.",
  keywords: ["data engineer", "data analytics", "machine learning", "cloud solutions", "portfolio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="flex flex-col min-h-screen w-full">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
