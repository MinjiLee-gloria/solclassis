// src/components/DonateButton.tsx
"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useState } from "react";
import { getProgram, getConnection } from "@/utils/solana";

interface DonateButtonProps {
  campaignId: string;
  donationAmount: number;
}

export function DonateButton({ campaignId, donationAmount }: DonateButtonProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async () => {
    if (!publicKey) {
      alert("지갑을 연결해주세요!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorPublicKey: publicKey.toString(), amount: donationAmount }),
      });

      const { transaction, error } = await res.json();
      if (!res.ok || error) throw new Error(error || "API 요청 실패");

      const tx = Transaction.from(Buffer.from(transaction, "base64"));
      const connection = getConnection(); // Connection 객체 가져오기
      const signature = await sendTransaction(tx, connection); // 객체 대신 직접 전달
      await connection.confirmTransaction(signature);

      alert(`기부 성공! 트랜잭션: ${signature}`);
    } catch (err) {
      console.error("기부 오류:", err);
      setError("기부에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDonate}
        disabled={loading || !publicKey}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "처리 중..." : `${donationAmount} SOL 기부하기`}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}