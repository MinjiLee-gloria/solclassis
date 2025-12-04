import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import BN from "bn.js";
import idlJson from "@/idl/solclassis.json";
import type { Wallet as AnchorWallet } from "@coral-xyz/anchor/dist/cjs/provider";

const LAMPORTS_PER_SOL = 1_000_000_000;

interface CreateCampaignParams {
  title: string;
  description: string;
  goalSol: number;
  donationSol: number;
  endDate: Date; // JS Date
}

// wallet: wallet-adapter의 adapter (publicKey, signTransaction 등 포함)
export async function createCampaignOnChain(
  wallet: any,
  params: CreateCampaignParams
) {
  if (!wallet?.publicKey) {
    throw new Error("지갑이 연결되어 있지 않습니다.");
  }

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const anchorWallet: AnchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };

  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
  });

  // 프로그램 ID는 IDL 안에 들어있다고 가정
  const program = new Program(idlJson as Idl, provider);

  // 새 캠페인 계정용 키쌍 생성
  const campaignKeypair = Keypair.generate();

  const goalLamports = new BN(Math.round(params.goalSol * LAMPORTS_PER_SOL));
  const donationLamports = new BN(
    Math.round(params.donationSol * LAMPORTS_PER_SOL)
  );
  const endTimestamp = new BN(
    Math.floor(params.endDate.getTime() / 1000) // i64 unix timestamp
  );

  // 일단 테스트 단계에서는 foundation = creator 로 둠
  const foundationPubkey = new PublicKey(
    process.env.NEXT_PUBLIC_FOUNDATION_WALLET || wallet.publicKey.toBase58()
  );

  console.log("📡 createCampaign args:", {
    title: params.title,
    description: params.description,
    goalLamports: goalLamports.toString(),
    donationLamports: donationLamports.toString(),
    endTimestamp: endTimestamp.toString(),
    campaign: campaignKeypair.publicKey.toBase58(),
    creator: wallet.publicKey.toBase58(),
    foundation: foundationPubkey.toBase58(),
  });

  const txSig = await program.methods
    .createCampaign(
      params.title,
      params.description,
      goalLamports,
      donationLamports,
      endTimestamp
    )
    .accounts({
      campaign: campaignKeypair.publicKey,
      creator: wallet.publicKey,
      foundation: foundationPubkey,
      systemProgram: SystemProgram.programId,
    })
    .signers([campaignKeypair])
    .rpc();

  console.log("✅ Campaign created. tx:", txSig);

  return {
    txSig,
    campaignPubkey: campaignKeypair.publicKey.toBase58(),
  };
}