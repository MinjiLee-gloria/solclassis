import { getProgram } from "@/utils/solana";
import BN from "bn.js"; 
export async function POST(req: Request) {
  const program = getProgram(); 

  if (!program) {
    console.error("❌ Solana program is not initialized!");
    return new Response(JSON.stringify({ success: false, error: "Solana program is not initialized!" }), { status: 500 });
  }

  try {
    const { goal, endDate } = await req.json();

    const tx = await program.methods
      .createCampaign(new BN(goal), new BN(endDate)) // ✅ 올바른 방식
      .rpc();

    return new Response(JSON.stringify({ success: true, tx }), { status: 200 });
  } catch (error) {
    console.error("❌ Error creating campaign:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}