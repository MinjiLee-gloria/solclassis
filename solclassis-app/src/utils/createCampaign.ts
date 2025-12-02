import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import idlJson from "@/idl/solclassis.json";
import BN from "bn.js";
import type { Wallet as AnchorWallet } from "@coral-xyz/anchor/dist/cjs/provider";

// wallet은 wallet-adapter-react의 wallet 객체입니다.
export async function createCampaign(wallet: any, goal: number, endDate: number) {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // 필요한 속성을 추출하여 AnchorWallet 객체를 직접 만듭니다.
  const anchorWallet: AnchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  };

  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
  });
  const program = new Program(idlJson as Idl, provider);

  try {
    if (!anchorWallet.publicKey) {
      console.error("❌ Wallet not connected!");
      return;
    }

    console.log("📡 Creating campaign with:", { goal, endDate });

    const tx = await program.methods
      .createCampaign(new BN(goal), new BN(endDate))
      .rpc();

    console.log("✅ Campaign created successfully! Transaction:", tx);
    return tx;
  } catch (error) {
    console.error("❌ Error creating campaign:", error);
  }
}
