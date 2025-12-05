// src/app/dev/test-create/page.tsx
"use client";

import { useState } from "react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {  } from "@/utils/createCampaign";

export default function TestCreateCampaignPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setError(null);
      setResult(null);

      if (!wallet.publicKey) {
        setError("지갑이 연결되어 있지 않습니다.");
        return;
      }

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });

      const { txSig, campaignPubkey } = await (
        provider,
        wallet.publicKey,
        {
          title: "테스트 캠페인",
          description: "테스트 설명입니다.",
          goal: 1_000_000_000,       // 1 SOL 기준 예시
          donationAmount: 100_000_000, // 0.1 SOL
          endDate: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // 일주일 뒤
        },
      );

      setResult(
        `✅ 성공!\nTx: ${txSig}\nCampaign: ${campaignPubkey.toBase58()}`
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <button onClick={handleCreate}>테스트 캠페인 생성</button>
      {error && <p style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</p>}
      {result && <p style={{ color: "lime", whiteSpace: "pre-wrap" }}>{result}</p>}
    </div>
  );
}
