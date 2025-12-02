import { NextRequest, NextResponse } from "next/server";
import { getProgram } from "@/utils/solana";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { donorPublicKey, amount } = await req.json();

  try {
    const program = getProgram();
    const campaignPubkey = new PublicKey(id);
    const donorPubkey = new PublicKey(donorPublicKey);
    const [donationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("donation"), donorPubkey.toBuffer(), campaignPubkey.toBuffer()],
      program.programId
    );

    const lamports = amount * 1_000_000_000; // SOL to lamports
    const tx = await program.methods
      .donate(lamports)
      .accounts({
        campaign: campaignPubkey,
        donor: donorPubkey,
        donation: donationPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const serializedTx = tx.serialize({ requireAllSignatures: false }).toString("base64");
    return NextResponse.json({ transaction: serializedTx });
  } catch (error) {
    console.error("기부 트랜잭션 생성 오류:", error);
    return NextResponse.json({ error: "기부 트랜잭션 생성 실패" }, { status: 500 });
  }
}