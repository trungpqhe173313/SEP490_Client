import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { LoadingProvider } from "@/context/LoadingContext";
import { LoginProvider } from "@/context/LoginContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ metadata must be defined here (server side)
export const metadata = {
  title: "NutriBarn",
  description: "NutriBarn",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoginProvider>
          <LoadingProvider>
            <ClientLayout>{children}</ClientLayout>
          </LoadingProvider>
        </LoginProvider>
      </body>
    </html>
  );
}
