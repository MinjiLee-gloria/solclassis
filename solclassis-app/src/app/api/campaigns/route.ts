import { NextResponse } from "next/server";
import { getProgram } from "@/utils/solana";
import BN from "bn.js";
import type { Campaign } from "@/types/campaign";

export async function GET(request: Request) {
  try {
    const program = getProgram();
    if (!program) {
      console.error("❌ Solana program is not initialized!");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const LAMPORTS_PER_SOL = 1_000_000_000;
    const campaignsData = await program.account.campaign.all();
    const campaigns: Campaign[] = campaignsData.map((c: any) => ({
      id: c.publicKey.toString(),
      creator: c.account.creator.toString(),
      foundation: c.account.foundation.toString(),
      title: c.account.title ? String(c.account.title) : "제목 없는 캠페인",
      description: c.account.description ? String(c.account.description) : "설명 없음",
      goal: (c.account.goal as BN).toNumber() / LAMPORTS_PER_SOL,
      donationAmount: (c.account.donation_amount as BN).toNumber() / LAMPORTS_PER_SOL,
      raised: (c.account.raised as BN).toNumber() / LAMPORTS_PER_SOL,
      endDate: new Date((c.account.end_date as BN).toNumber() * 1000)
        .toISOString()
        .split("T")[0],
      complete: c.account.complete as boolean,
      failed: c.account.failed as boolean,
    }));

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("캠페인 목록 조회 오류:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
