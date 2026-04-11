import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import OTPModal from "@/components/OTPModal";
import Script from "next/script";
import React from "react";
import { ThemeProvider } from "next-themes";
import { useDynamicTheme } from "@/lib/useDynamicTheme";

function DynamicThemeHandler() {
  useDynamicTheme();
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <UserProvider>
        <DynamicThemeHandler />
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
          <title>Your-Tube Clone</title>
          <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <Toaster position="top-center" closeButton />
          <OTPModal />
          <div className="flex relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 min-w-0 bg-background">
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}
