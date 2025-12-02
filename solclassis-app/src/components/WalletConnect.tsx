"use client";
import React, { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import WalletModal from "@/components/WalletModal";
import { WalletName } from "@solana/wallet-adapter-base";

const WalletConnect: React.FC = () => {
  const { connected, publicKey, disconnect, select } = useWallet();
  const { connection } = useConnection();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = (walletName: WalletName) => {
    select(walletName);
    setIsModalOpen(false);
  };

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <div className="relative flex flex-col items-center">
      {/* 버튼 클릭 시 모달 열기 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-neon-pink text-white font-bold py-2 px-4 rounded hover:bg-neon-pink-hover transition"
      >
        {connected && publicKey
          ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}`
          : "Connect Wallet"}
      </button>

      {/* 네트워크 및 주소 정보 */}
      {connected && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-400">
            Network: <span className="text-neon-violet">Devnet</span>
          </p>
          <p className="text-sm text-gray-400">
            Address: <span className="text-neon-violet">{publicKey?.toBase58()}</span>
          </p>
        </div>
      )}

      {/* 연결된 경우 Disconnect 버튼 */}
      {connected && (
        <button
          onClick={handleDisconnect}
          className="mt-2 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition"
        >
          Disconnect
        </button>
      )}

      {/* 모달 컴포넌트 */}
      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConnect={handleConnect} />
    </div>
  );
};

export default WalletConnect;
