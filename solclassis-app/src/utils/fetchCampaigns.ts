// src/utils/fetchCampaigns.ts
import { getProgram } from "@/utils/solana";
import BN from "bn.js";
import type { Campaign } from "@/types/campaign";

const LAMPORTS_PER_SOL = 1_000_000_000;

export const fetchCampaigns = async (): Promise<Campaign[]> => {
  const program = getProgram();

  if (!program) {
    throw new Error("Solana program is not initialized");
  }

  console.log("📡 Fetching campaigns...");
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
    complete: Boolean(c.account.complete),
    failed: Boolean(c.account.failed),
  }));

  return campaigns;
};
