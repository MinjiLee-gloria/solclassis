import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { WalletContextProvider } from "@/contexts/WalletContext";

export const metadata: Metadata = {
  title: "SOLCLASSIS",
  description: "Solana 기반 집단소송·공익소송 크라우드펀딩 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white">
        <WalletContextProvider>
          <NavBar />
          <main className="min-h-screen max-w-5xl mx-auto px-4">
            {children}
          </main>
          <Footer />
        </WalletContextProvider>
      </body>
    </html>
  );
}