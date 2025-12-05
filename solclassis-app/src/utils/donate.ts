// src/utils/donate.ts
import {
  AnchorProvider,
  BorshCoder,
  Idl,
} from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import { PROGRAM_ID } from "./solana"; 
import idl from "../anchor/solclassis.json"; 

const coder = new BorshCoder(idl as Idl);

// PDA: seeds = ["donation", donor, campaign]
export function getDonationPda(donorPubkey: PublicKey, campaignPubkey: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("donation"),
      donorPubkey.toBuffer(),
      campaignPubkey.toBuffer(),
    ],
    PROGRAM_ID
  );
}

/**
 * 온체인 donate 호출
 * - campaignPubkey: 캠페인 계정
 * - donorPubkey: 기부자(지갑) 계정
 * - amount: 기부 금액 (u64, 여기서는 lamports 숫자)
 */
export async function donateOnChain(
  provider: AnchorProvider,
  campaignPubkey: PublicKey,
  donorPubkey: PublicKey,
  amount: number
) {
  const [donationPda] = getDonationPda(donorPubkey, campaignPubkey);

  // 1) 후원자 PDA 생성 (IDL name: create_donation_pda, args 없음)
  const createDonationPdaData = coder.instruction.encode(
    "create_donation_pda",
    {}
  );

  const ixCreateDonationPda = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      // IDL 계정 순서:
      // donation, donor, campaign, system_program
      { pubkey: donationPda,    isSigner: false, isWritable: true },
      { pubkey: donorPubkey,    isSigner: true,  isWritable: true },
      { pubkey: campaignPubkey, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: createDonationPdaData,
  });

  // 2) donate (IDL name: donate, args: { amount: u64 })
  const donateData = coder.instruction.encode("donate", {
    amount: new BN(amount), 
  });

  const ixDonate = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      // IDL 계정 순서:
      // campaign, donor, donation, system_program
      { pubkey: campaignPubkey, isSigner: false, isWritable: true },
      { pubkey: donorPubkey,    isSigner: true,  isWritable: true },
      { pubkey: donationPda,    isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: donateData,
  });

  const tx = new Transaction().add(ixCreateDonationPda, ixDonate);

  const sig = await provider.sendAndConfirm(tx, []);

  return sig;
}
