// src/app/create/page.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import CampaignForm from "@/components/CampaignForm";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

export default function CreatePage() {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Create Campaign (Admin)</h1>
        <p className="text-sm text-gray-300 mb-2">
          이 페이지는 Solclassis 운영자 전용입니다.
        </p>
        <p className="text-sm text-gray-400">
          우측 상단에서 먼저 지갑을 연결해 주세요.
        </p>
      </div>
    );
  }

  if (!ADMIN_WALLET || publicKey.toBase58() !== ADMIN_WALLET) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
        <p className="text-sm text-gray-400">
          이 페이지는 Solclassis 운영자 전용입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Create Campaign (Admin)</h1>
      <p className="text-sm text-red-400 mb-6">
        ※ 이 페이지는 Solclassis 운영자가 사건을 검토한 뒤 캠페인을 개설할 때만
        사용합니다.
      </p>
      <CampaignForm />
    </div>
  );
}
