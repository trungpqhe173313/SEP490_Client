"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/header";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/Navbar/navbar";

const blacklistPathnames = ["/404", "/login"];

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  if (blacklistPathnames.includes(pathname)) {
    return children;
  }

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
