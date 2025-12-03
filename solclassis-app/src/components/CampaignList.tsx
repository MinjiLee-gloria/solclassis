// src/components/CampaignList.tsx
"use client";

import { useEffect, useState } from "react";
import type { Campaign } from "@/types/campaign";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/fetchCampaigns");

        if (!res.ok) {
          const text = await res.text();
          console.error("Error response from /api/fetchCampaigns:", res.status, text);
          setError("캠페인 목록을 불러오는데 실패했습니다.");
          return;
        }

        const data: Campaign[] = await res.json();
        setCampaigns(data);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (campaigns.length === 0) {
    return <p>No campaigns found</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Campaigns</h2>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id} className="p-4 border-b">
            <h3 className="font-semibold">{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p>Target: {campaign.goal} SOL</p>
            <p>Raised: {campaign.raised} SOL</p>
            <p>Donation unit: {campaign.donationAmount} SOL</p>
            <p>Ends: {campaign.endDate}</p>
            <p>Creator: {campaign.creator}</p>
            <p>
              Status:{" "}
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
