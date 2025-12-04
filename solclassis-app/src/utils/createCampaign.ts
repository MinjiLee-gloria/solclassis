// src/utils/createCampaign.ts
import {
  AnchorProvider,
  BorshCoder,
  Idl,
  BN,
} from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import idl from "../anchor/solclassis.json";

const PROGRAM_ID = new PublicKey("Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3");

export type CreateCampaignParams = {
  title: string;
  description: string;
  goal: number;
  donationAmount: number;
  endDate: number; // unix timestamp (초)
};

export async function createCampaignOnChain(
  provider: AnchorProvider,
  creatorPubkey: PublicKey,
  params: CreateCampaignParams,
  foundationPubkey?: PublicKey,
) {
  const campaignKeypair = Keypair.generate();
  const foundation = foundationPubkey ?? creatorPubkey;

  // 1) IDL에서 create_campaign 계열 instruction 찾기
  const idlTyped = idl as Idl & { instructions?: any[] };
  const createIx = idlTyped.instructions?.find((ix: any) =>
    ix.name.toLowerCase().includes("create") &&
    ix.name.toLowerCase().includes("campaign")
  );

  if (!createIx) {
    const names =
      idlTyped.instructions?.map((ix: any) => ix.name).join(", ") ?? "[]";
    throw new Error(
      `create_campaign instruction not found in IDL. instructions: ${names}`,
    );
  }

  const methodName = createIx.name;
  const coder = new BorshCoder(idlTyped);

  // 2) IDL의 args 이름에 따라 값 매핑
  const values: any = {};
  for (const arg of createIx.args as { name: string }[]) {
    const n = arg.name.toLowerCase();

    if (n.includes("title")) {
      values[arg.name] = params.title;
    } else if (n.includes("desc")) {
      values[arg.name] = params.description;
    } else if (n.includes("goal") || n.includes("target")) {
      values[arg.name] = new BN(params.goal);
    } else if (n.includes("donation") || n.includes("amount")) {
      values[arg.name] = new BN(params.donationAmount);
    } else if (n.includes("end") && n.includes("date")) {
      values[arg.name] = new BN(params.endDate);
    } else {
      // 혹시 모르는 arg는 일단 0으로
      values[arg.name] = new BN(0);
    }
  }

  // 3) BorshCoder로 인코딩
  const data = coder.instruction.encode(methodName, values);

  // 4) 계정 메타
  const keys = [
    {
      pubkey: campaignKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: creatorPubkey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: foundation,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ];

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys,
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = creatorPubkey;

  const txSig = await provider.sendAndConfirm(tx, [campaignKeypair]);

  return {
    txSig,
    campaignPubkey: campaignKeypair.publicKey,
  };
}
