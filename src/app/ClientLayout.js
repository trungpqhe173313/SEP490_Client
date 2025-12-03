"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/header";
import Navbar from "@/components/Navbar/navbar";

const blacklistPathnames = ["/404", "/login", "/forgot-password", "/verify-otp", "/reset-password"];

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  if (blacklistPathnames.includes(pathname)) {
    return children;
  }

  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50">
        <Header />
        <Navbar />
      </div>
      <div className="ml-50">
        {children}
      </div>
      {/* <Footer /> */}
    </>
  );
}
