// src/app/create/page.tsx
"use client";

import CampaignForm from "@/components/CampaignForm";

export default function CreatePage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Create Campaign (Admin)</h1>
      <p className="text-sm text-red-400 mb-4">
      ※ 이 페이지는 Solclassis 운영자가 사건을 검토한 뒤 캠페인을 개설할 때만 사용합니다.
      일반 사용자는 이 페이지를 이용하지 않습니다.
      </p>
      <CampaignForm />
    </div>
  );
}
