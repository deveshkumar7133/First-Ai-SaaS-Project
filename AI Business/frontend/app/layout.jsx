import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "InstantSite AI",
  description: "AI powered website generator that creates business websites automatically.",
  openGraph: {
    title: "InstantSite AI",
    description: "AI powered website generator that creates business websites automatically.",
    url: "/",
    siteName: "InstantSite AI",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "InstantSite AI",
    description: "AI powered website generator that creates business websites automatically."
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-slate-300">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

