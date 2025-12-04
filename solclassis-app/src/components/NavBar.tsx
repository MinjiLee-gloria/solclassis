"use client";

import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@solana/wallet-adapter-react";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

export default function NavBar() {
  const { publicKey } = useWallet();

  const isAdmin =
    !!publicKey && ADMIN_WALLET && publicKey.toBase58() === ADMIN_WALLET;

  return (
    <header className="border-b border-gray-800 bg-black/60 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight">
          <span className="text-pink-400">SOL</span>
          <span>CLASSIS</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-gray-300">
          <Link href="/campaigns" className="hover:text-white">
            캠페인
          </Link>
          <Link href="/about" className="hover:text-white">
            소개
          </Link>

          {isAdmin && (
            <Link href="/create" className="hover:text-white">
              캠페인 생성
            </Link>
          )}
        </nav>

        <div className="flex-shrink-0">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
