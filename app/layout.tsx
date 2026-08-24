import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BackgroundDrift } from "@/components/BackgroundDrift";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Core Traits & Recognition Awards | Medtronic LABS",
  description:
    "Nominate a colleague who brings Medtronic LABS' Core Traits to life.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen font-sans">
        <BackgroundDrift />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
