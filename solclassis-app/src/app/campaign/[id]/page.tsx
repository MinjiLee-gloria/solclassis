"use client"; // 클라이언트 사이드에서 실행됨을 나타냅니다.

import { useEffect, useState } from "react";

// Next.js 동적 라우트의 params에서 캠페인 id를 추출합니다.
export default function CampaignDetail({ params }: { params: { id: string } }) {
  const { id } = params; // URL에 포함된 캠페인 id

  // 캠페인 데이터, 에러, 로딩 상태를 관리합니다.
  const [campaign, setCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트될 때 API 엔드포인트에서 캠페인 데이터를 불러옵니다.
  useEffect(() => {
    async function fetchCampaign() {
      try {
        // API 엔드포인트: src/app/api/campaigns/[id]/route.ts 에서 처리되는 캠페인 상세 조회
        const res = await fetch(`/api/campaigns/${id}`);
        if (!res.ok) {
          throw new Error("캠페인 데이터를 불러오는데 실패했습니다.");
        }
        const data = await res.json();
        setCampaign(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchCampaign();
  }, [id]);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!campaign) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
      <p className="text-gray-700 mb-2">📝 설명: {campaign.description}</p>
      <p className="mb-2">🎯 목표 금액: {campaign.goal} SOL</p>
      <p className="mb-2">💰 모금된 금액: {campaign.raised} SOL</p>
      <p className="mb-2">📅 종료일: {campaign.endDate}</p>
      <p className="mb-2">👤 생성자: {campaign.creator}</p>
      <p className="mb-2">🏦 재단 지갑: {campaign.foundation}</p>
      <p className="mb-2">
        상태: {campaign.complete ? "✅ 완료" : campaign.failed ? "❌ 실패" : "⏳ 진행 중"}
      </p>
    </div>
  );
}
