import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color challenge",
  description: "Vote for your favorite color",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        <div className="fixed bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-full backdrop-blur">
          Built by{" "}
          <a
            href="https://github.com/obiofiong"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300"
          >
            John moon
          </a>
        </div>
      </body>
      <Toaster position="top-center" />
    </html>
  );
}
