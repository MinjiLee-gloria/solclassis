import { NextResponse, NextRequest } from 'next/server';
import { getProgram } from '@/utils/solana';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import type { Campaign } from '@/types/campaign';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const program = getProgram();
    const publicKey = new PublicKey(id);
    const campaignData = await program.account.campaign.fetch(publicKey);

    const LAMPORTS_PER_SOL = 1_000_000_000;
    const campaign: Campaign = {
      id,
      creator: campaignData.creater.toString(),
      foundation: campaignData.foundation.toString(),
      title: campaignData.title ? String(campaignData.title) : "제목 없음",
      description: campaignData.description ? String(campaignData.description) : "설명 없음",
      goal: (campaignData.goal as BN).toNumber() / LAMPORTS_PER_SOL,
      donationAmount: (campaignData.donation_amount as BN).toNumber() / LAMPORTS_PER_SOL,
      raised: (campaignData.raised as BN).toNumber() / LAMPORTS_PER_SOL,
      endDate: new Date((campaignData.end_date as BN).toNumber() * 1000)
        .toISOString()
        .split("T")[0],
      complete: campaignData.complete as boolean,
      failed: campaignData.failed as boolean,
    };

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("캠페인 조회 오류:", error);
    return NextResponse.json({ error: "캠페인을 찾을 수 없습니다." }, { status: 404 });
  }
}