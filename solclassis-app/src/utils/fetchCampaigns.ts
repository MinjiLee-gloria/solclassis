// src/utils/fetchCampaigns.ts
import type { Campaign } from "@/types/campaign";

// 💡 지금은 Solana 대신 목업 데이터를 반환하는 버전으로 전환
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  // 나중에 여기 Solana 연동 다시 붙일 거라 함수 이름/타입은 그대로 둠

  // 오늘은 프론트 UI 확인이 목적이니까, 하드코딩된 예시 데이터 몇 개 넣자
  return [
    {
      id: "CAMPAIGN_001",
      creator: "Solclassis Admin",
      foundation: "Justice Foundation Wallet",
      title: "가상자산 거래소 이상출금 피해 집단소송",
      description:
        "특정 거래소의 장기간 출금 지연 및 이상출금 의혹과 관련해 피해 투자자들을 위한 집단소송을 준비하는 캠페인입니다.",
      goal: 1_000, // SOL 단위 예시
      donationAmount: 1, // 1 SOL씩 참여
      raised: 320,
      endDate: "2026-01-31",
      complete: false,
      failed: false,
    },
    {
      id: "CAMPAIGN_002",
      creator: "Solclassis Admin",
      foundation: "Consumer Rights Foundation",
      title: "해외 부동산 사기 피해자 공동구제 소송",
      description:
        "허위 분양·과장 광고로 인한 해외 부동산 투자 사기 피해자를 위한 공동구제 소송 캠페인입니다.",
      goal: 500,
      donationAmount: 0.5,
      raised: 500,
      endDate: "2025-12-31",
      complete: true,
      failed: false,
    },
    {
      id: "CAMPAIGN_003",
      creator: "Solclassis Admin",
      foundation: "Data Protection Watch",
      title: "개인정보 대량 유출 사고 손해배상 소송",
      description:
        "대규모 개인정보 유출 사고로 인한 이용자 손해배상 청구를 위한 소송 캠페인입니다.",
      goal: 800,
      donationAmount: 0.2,
      raised: 120,
      endDate: "2026-03-15",
      complete: false,
      failed: false,
    },
  ];
};
