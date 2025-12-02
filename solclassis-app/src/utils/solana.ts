// src/utils/solana.ts
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "@/idl/solclassis.json"; // Anchor 빌드 시 생성된 IDL 파일

const PROGRAM_ID = new PublicKey("Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3");

let program: Program | null = null;

export function getProgram(): Program {
  if (!program) {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    // 서버 측에서는 지갑이 필요 없으므로 더미 provider 사용
    const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" });
    program = new Program(IDL as any, PROGRAM_ID, provider);
  }
  return program;
}

export function getConnection(): Connection {
  return getProgram().provider.connection;
}