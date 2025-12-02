import { NextRequest, NextResponse } from "next/server";
import { BN } from "@coral-xyz/anchor";
import { getProgram } from "@/utils/solana"; // ✅ `getProgram`을 사용하여 프로그램 불러오기

export async function POST(req: NextRequest) {
  const program = getProgram(); // ✅ 프로그램 가져오기

  if (!program) {
    console.error("❌ Solana program is not initialized!");
    return NextResponse.json({ error: "Solana program is not initialized!" }, { status: 500 });
  }

  try {
    const { goal, endDate } = await req.json();

    console.log("📡 Creating campaign with:", { goal, endDate });

    const tx = await program.methods
      .createCampaign(new BN(goal), new BN(endDate)) // ✅ 올바른 방식
      .rpc();

    console.log("✅ Campaign created:", tx);
    return NextResponse.json({ success: true, tx });
  } catch (error) {
    console.error("❌ Error creating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}