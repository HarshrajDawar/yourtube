import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FooterSignature from "@/components/FooterSignature";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import OTPModal from "@/components/OTPModal";
import Script from "next/script";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <UserProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
        <Script 
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="afterInteractive" 
        />
        <title>Your-Tube Clone</title>
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Toaster theme="dark" position="top-center" closeButton />
        <OTPModal />
        <div className="flex relative flex-1">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <div className="flex-1 min-w-0 bg-background flex flex-col">
            <main className="flex-1">
              <Component {...pageProps} />
            </main>
            <FooterSignature />
          </div>
        </div>
      </div>
    </UserProvider>
  );
}
