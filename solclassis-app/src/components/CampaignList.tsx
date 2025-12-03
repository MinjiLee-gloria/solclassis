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
          console.error(
            "Error response from /api/fetchCampaigns:",
            res.status,
            text
          );
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
    return <p className="text-gray-400">아직 등록된 캠페인이 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const progress =
          campaign.goal > 0
            ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
            : 0;

        const statusLabel = campaign.complete
          ? "완료"
          : campaign.failed
          ? "실패"
          : "진행 중";

        const statusColor = campaign.complete
          ? "bg-emerald-600"
          : campaign.failed
          ? "bg-red-600"
          : "bg-indigo-600";

        return (
          <div
            key={campaign.id}
            className="border border-gray-700 rounded-xl p-4 bg-gray-900/60 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {campaign.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  주최: Solclassis · 재단: {campaign.foundation}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full text-white ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            <p className="text-sm text-gray-300 mt-3">
              {campaign.description}
            </p>

            <div className="mt-4 space-y-1 text-sm text-gray-300">
              <p>
                목표 금액:{" "}
                <span className="font-semibold">
                  {campaign.goal.toLocaleString()} SOL
                </span>
              </p>
              <p>
                모금된 금액:{" "}
                <span className="font-semibold">
                  {campaign.raised.toLocaleString()} SOL
                </span>{" "}
                ({progress}
                %)
              </p>
              <p>기부 단위 금액: {campaign.donationAmount} SOL</p>
              <p>종료일: {campaign.endDate}</p>
            </div>

            <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
