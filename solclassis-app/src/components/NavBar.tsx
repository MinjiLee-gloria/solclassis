"use client";
import React from "react";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";

export default function NavBar() {
  return (
    <nav className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-md">
      <Link href="/" className="text-xl font-bold text-neon-pink">Solclassis</Link>
      <div className="space-x-6">
        <Link href="/campaigns" className="hover:text-gray-400">Campaigns</Link>
        <Link href="/campaigns/create" className="hover:text-gray-400">Create</Link>
      </div>
      <WalletConnect />
    </nav>
  );
}
