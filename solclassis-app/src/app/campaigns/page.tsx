// src/app/campaigns/page.tsx
import CampaignList from "@/components/CampaignList";

export default function CampaignsPage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-4">캠페인 전체 보기</h1>
      <p className="text-gray-300 mb-6 text-sm">
        Solclassis가 운영 중인 집단소송·공익 소송 캠페인 전체 목록입니다.
      </p>
      <CampaignList />
    </div>
  );
}
