// src/components/CampaignList.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Campaign } from "@/types/campaign";

interface ApiError extends Error {
  status?: number;
}

function getStatusBadge(c: Campaign) {
  const now = new Date();
  const end = new Date(c.endDate);

  if (c.failed) {
    return { label: "실패", className: "bg-red-500/10 text-red-300" };
  }
  if (c.complete || c.raised >= c.goal) {
    return { label: "완료", className: "bg-emerald-500/10 text-emerald-300" };
  }
  if (end < now) {
    return { label: "종료", className: "bg-gray-500/10 text-gray-300" };
  }
  return { label: "진행 중", className: "bg-indigo-500/10 text-indigo-300" };
}

function ProgressBar({ goal, raised }: { goal: number; raised: number }) {
  const ratio = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="mt-4">
      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {raised} SOL / {goal} SOL ({ratio}%)
      </p>
    </div>
  );
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch("/api/campaigns");
  
      if (!res.ok) {
        const text = await res.text();
        const err: ApiError = new Error("API 요청 실패");
        err.status = res.status;
        console.error("❌ /api/campaigns error:", res.status, text);
        throw err;
      }
  
      const json = await res.json();
  
      // 🔥 여기서 배열 형태로 강제 변환
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : [];
  
      setCampaigns(list);
    } catch (err: any) {
      console.error("❌ 캠페인 불러오기 실패:", err);
      setError(
        err?.message || "캠페인 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => !c.failed),
    [campaigns]
  );
  const closedCampaigns = useMemo(
    () => campaigns.filter((c) => c.failed),
    [campaigns]
  );

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
        <p className="ml-4 text-gray-400">캠페인을 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/70 rounded-lg">
        <p className="text-red-400 font-semibold mb-2">
          ❌ 캠페인을 불러올 수 없습니다
        </p>
        <p className="text-red-200 text-xs mb-3 break-all">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 rounded-md text-white"
        >
          🔄 다시 시도
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        아직 등록된 캠페인이 없습니다. Solclassis가 검토 중입니다.
      </p>
    );
  }

  const renderCampaignCard = (c: Campaign) => {
    const badge = getStatusBadge(c);

    return (
      <li
        key={c.id}
        className="p-5 mb-4 rounded-xl border border-gray-800 bg-gray-900/60 hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{c.title}</h3>
            <p className="text-xs text-gray-400 mb-2">
              주최: Solclassis · 재단: {c.foundation}
            </p>
            <p className="text-sm text-gray-300">{c.description}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-300">
          <div>
            <p className="text-gray-400">목표 금액</p>
            <p className="font-semibold">{c.goal} SOL</p>
          </div>
          <div>
            <p className="text-gray-400">모금된 금액</p>
            <p className="font-semibold">{c.raised} SOL</p>
          </div>
          <div>
            <p className="text-gray-400">기부 단위 금액</p>
            <p className="font-semibold">{c.donationAmount} SOL</p>
          </div>
          <div>
            <p className="text-gray-400">종료일</p>
            <p className="font-semibold">{c.endDate}</p>
          </div>
        </div>

        <ProgressBar goal={c.goal} raised={c.raised} />
      </li>
    );
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">진행 중인 캠페인</h2>
        <ul>
          {activeCampaigns.length > 0 ? (
            activeCampaigns.map(renderCampaignCard)
          ) : (
            <p className="text-sm text-gray-400">
              현재 진행 중인 캠페인이 없습니다.
            </p>
          )}
        </ul>
      </section>

      {closedCampaigns.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">종료된 캠페인</h2>
          <ul>{closedCampaigns.map(renderCampaignCard)}</ul>
        </section>
      )}
    </div>
  );
}
