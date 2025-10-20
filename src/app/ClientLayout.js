"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/Navbar/navbar";
import Loader from "@/components/Loader/loader";

const blacklistPathnames = ["/404", "/login"];

export default function ClientLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  if (blacklistPathnames.includes(pathname)) {
    return children;
  }

  return (
    <>
      <div className="sticky top-0 z-50">
        <Header />
        <Navbar />
      </div>
      {children}
      <Footer />
    </>
  );
}
