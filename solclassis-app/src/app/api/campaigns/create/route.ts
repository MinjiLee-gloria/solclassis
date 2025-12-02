import { NextResponse } from "next/server";
import { createCampaign as createCampaignUtil } from "@/utils/createCampaign";
import { PublicKey } from "@solana/web3.js";

// 더미 지갑 생성 (예시용). 실제 서비스에서는 비밀키 관리가 필요합니다.
const dummyWallet = {
  publicKey: new PublicKey("11111111111111111111111111111111"),
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any) => txs,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, endDate } = body;

    if (goal === undefined || endDate === undefined) {
      return NextResponse.json({ error: "Missing goal or endDate" }, { status: 400 });
    }

    // 서버 전용 지갑(dummyWallet)을 사용하여 캠페인 생성
    const tx = await createCampaignUtil(dummyWallet, Number(goal), Number(endDate));

    return NextResponse.json({ transaction: tx });
  } catch (error) {
    console.error("캠페인 생성 오류:", error);
    return NextResponse.json({ error: "캠페인 생성에 실패했습니다." }, { status: 500 });
  }
}
