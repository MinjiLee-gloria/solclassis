// src/hooks/useProgram.ts
import { useMemo } from "react";
import { AnchorProvider } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import rawIdl from "../anchor/solclassis.json"; // 방금 덮어쓴 IDL

const PROGRAM_ID = new PublicKey("Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3");

export function useProgram(): any {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      return null;
    }

    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });

    const idl: any = rawIdl; 
    const anchorAny: any = anchor;
    const program = new anchorAny.Program(idl, PROGRAM_ID, provider);

    return program;
  }, [
    connection,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);
}
