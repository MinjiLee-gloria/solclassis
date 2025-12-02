"use client";
import React from "react";
import { WalletName } from "@solana/wallet-adapter-base"; // ✅ WalletName 타입 추가

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletName: WalletName) => void; 
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-dark p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-white">Connect a Wallet</h2>
        <button
          className="block w-full text-left p-2 bg-neon-violet hover:bg-neon-violet-hover text-white rounded-md transition"
          onClick={() => onConnect("Phantom" as WalletName)}
        >
          🟣 Connect Phantom Wallet
        </button>
        <button
          className="block w-full text-left p-2 mt-2 bg-neon-pink hover:bg-neon-pink-hover text-white rounded-md transition"
          onClick={() => onConnect("Solflare" as WalletName)}
        >
          🔥 Connect Solflare Wallet
        </button>
        <button
          className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
