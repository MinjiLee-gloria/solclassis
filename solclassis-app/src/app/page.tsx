import CampaignList from "@/components/CampaignList";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Solclassis Crowdfunding</h1>
      <p className="text-gray-300 mb-8 leading-relaxed">
        SOLCLASSIS가 선별한 집단소송·공익 소송 캠페인을 한 곳에서 확인하고,
        투명하게 펀딩에 참여할 수 있는 플랫폼입니다.
      </p>
      <CampaignList />
    </div>
  );
}
