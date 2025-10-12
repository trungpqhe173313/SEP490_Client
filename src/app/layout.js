"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/Navbar/navbar";
import Loader from "@/components/Loader/loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blacklistPathnames = ["/404", "/login"];

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html suppressHydrationWarning={true} lang="en">
      <head />
      <body suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {loading ? <Loader /> : (
          blacklistPathnames.includes(pathname) ? (
            children
          ) : (
            <>
              <div className="sticky top-0 z-50">
                <Header />
                <Navbar />
              </div>
              {children}
              <Footer />
            </>
          )
        )}
      </body>
    </html>
  );
}
