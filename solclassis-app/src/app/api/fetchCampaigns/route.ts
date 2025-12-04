import { NextResponse } from "next/server";
import { fetchCampaigns } from "@/utils/fetchCampaigns";
import type { Campaign } from "@/types/campaign";
import type { ApiResponse } from "@/types/api";

export async function GET() {
  try {
    const campaigns: Campaign[] = await fetchCampaigns();

    const body: ApiResponse<Campaign[]> = {
      success: true,
      data: campaigns,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error("❌ Failed to fetch campaigns:", error);

    const body: ApiResponse<null> = {
      success: false,
      error: error?.message || "Failed to fetch campaigns",
    };

    return NextResponse.json(body, { status: 500 });
  }
}