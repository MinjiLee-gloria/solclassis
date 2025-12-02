import type { Metadata } from "next";
import React from "react";
import { WalletContextProvider } from "@/contexts/WalletContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolClassis",
  description: "A decentralized crowdfunding platform on Solana",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0d0d0d] text-[#e0e0e0] font-inter">
        <WalletContextProvider>
          <NavBar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </WalletContextProvider>
      </body>
    </html>
  );
}