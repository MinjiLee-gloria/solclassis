"use client";

import { useEffect, useState } from "react";

// 캠페인 목록 페이지는 전체 캠페인 데이터를 API 엔드포인트를 통해 받아옵니다.
export default function CampaignList() {
  // 캠페인 목록, 로딩 상태, 에러 메시지를 관리합니다.
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트되면 /api/campaigns 엔드포인트에서 데이터를 가져옵니다.
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
          throw new Error("캠페인 목록을 불러오는데 실패했습니다.");
        }
        const data = await res.json();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">캠페인 목록</h1>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id} className="border p-4 mb-2">
            <h2 className="text-xl font-bold">{campaign.title}</h2>
            <p>{campaign.description}</p>
            <p>목표 금액: {campaign.goal} SOL</p>
            <p>모금된 금액: {campaign.raised} SOL</p>
            <p>종료일: {campaign.endDate}</p>
            <p>
              상태:{" "}
              {campaign.complete
                ? "✅ 완료"
                : campaign.failed
                ? "❌ 실패"
                : "⏳ 진행 중"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
