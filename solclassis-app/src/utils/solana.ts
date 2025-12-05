import { Program, AnchorProvider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "@/idl/solclassis.json";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLCLASSIS_PROGRAM_ID ??
    "Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3"
);

let program: Program | null = null;

export function getProgram(): Program {
  if (!program) {
    const connection = new Connection(RPC_URL, "confirmed");
    // 서버 측에서는 지갑이 없으니 더미 provider
    const provider = new AnchorProvider(connection, {} as any, {
      commitment: "confirmed",
    });
    program = new Program(IDL as any, PROGRAM_ID, provider);
  }
  return program;
}

export function getConnection(): Connection {
  return getProgram().provider.connection;
}