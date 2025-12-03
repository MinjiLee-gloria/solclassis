// src/app/api/fetchCampaigns/route.ts
import { NextResponse } from "next/server";
import { fetchCampaigns } from "@/utils/fetchCampaigns";

export async function GET() {
  try {
    const campaigns = await fetchCampaigns();
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error in /api/fetchCampaigns:", error);

    // 🔥 지금은 UI가 깨지는 것보다 "빈 리스트라도 보여주는 것"이 낫다
    //    나중에 디버깅 끝나면 500으로 돌려도 됨
    return NextResponse.json([], { status: 200 });
  }
}
