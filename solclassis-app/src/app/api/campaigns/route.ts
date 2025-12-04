import { NextResponse } from "next/server";
import type { Campaign } from "@/types/campaign";
import type { ApiResponse } from "@/types/api";

// 일단은 더미 데이터 (나중에 온체인 연동으로 교체)
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    creator: "Solclassis",
    foundation: "Justice Foundation Wallet",
    title: "가상자산 거래소 이상출금 피해 집단소송",
    description:
      "특정 거래소의 장기간 출금 지연 및 이상출금 의혹과 관련해 피해 투자자들을 위한 집단소송을 준비하는 캠페인입니다.",
    goal: 1000,
    donationAmount: 1,
    raised: 320,
    endDate: "2026-01-31",
    complete: false,
    failed: false,
  },
  {
    id: "2",
    creator: "Solclassis",
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
    id: "3",
    creator: "Solclassis",
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

export async function GET() {
  try {
    const body: ApiResponse<Campaign[]> = {
      success: true,
      data: MOCK_CAMPAIGNS,
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch campaigns:", error);
    const body: ApiResponse<Campaign[]> = {
      success: false,
      error: "Failed to fetch campaigns",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
