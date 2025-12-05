// src/app/api/campaigns/route.ts
import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { BorshCoder, Idl } from "@coral-xyz/anchor";
import idlJson from "@/anchor/solclassis.json";

// ✅ Next.js 가 이 API를 항상 서버(Node)에서 실행하도록
export const runtime = "nodejs";
// ✅ 매번 최신 온체인 상태를 보도록 (캐싱 방지)
export const dynamic = "force-dynamic";

// ⚠️ lib.rs 의 declare_id! 와 동일해야 함
const PROGRAM_ID = new PublicKey(
  "Hs68KZpxy8yxem4VhMXerpBQFK2YWJCbXMcYCDTNJTF3"
);

// 이 API가 브라우저로 돌려줄 캠페인 1건의 모양(= 구조, structure)
type ApiCampaign = {
  id: string;             // 리스트용 ID (여기서는 pubkey와 동일)
  pubkey: string;         // 캠페인 계정 주소
  creator: string;        // 생성자 지갑
  foundation: string;     // 재단 지갑

  title: string;
  description: string;
  goal: number;           // lamports
  donationAmount: number; // lamports
  raised: number;         // lamports
  endDate: number;        // 초 단위 숫자 (unix timestamp)
  complete: boolean;
  failed: boolean;
};

export async function GET() {
  try {
    // 1) devnet RPC 연결
    const endpoint =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet");
    const connection = new Connection(endpoint, "confirmed");
    console.log("🔌 [API] solclassis campaigns - endpoint:", endpoint);

    // 2) IDL 기반 coder
    const coder = new BorshCoder(idlJson as Idl);

    // 🔍 IDL 안에서 실제 account 이름이 뭔지 확인 (보통 'campaign')
    const accountsMeta = (idlJson as any).accounts ?? [];
    console.log(
      "📜 [API] IDL accounts:",
      accountsMeta.map((a: any) => a.name)
    );
    // name 이 'campaign' 이거나 'Campaign' 인 항목을 찾고, 없으면 'campaign' 으로 기본값
    const campaignAccountName: string =
      accountsMeta.find(
        (a: any) => a.name.toLowerCase() === "campaign"
      )?.name ?? "campaign";

    console.log(
      "🏷️ [API] campaign account name in IDL:",
      campaignAccountName
    );

    // 3) 이 프로그램이 소유한 모든 계정(raw) 가져오기
    const rawAccounts = await connection.getProgramAccounts(PROGRAM_ID);
    console.log("📦 [API] program accounts count:", rawAccounts.length);

    const campaigns: ApiCampaign[] = [];

    for (const { pubkey, account } of rawAccounts) {
      try {
        // 4) 각 계정을 'Campaign' 타입으로 디코딩
        const decoded: any = coder.accounts.decode(
          campaignAccountName,
          account.data
        );

        // 🔹 endDate: i64 (초 단위) → 숫자로 빼오기
        let endDateUnix: number;
        if (decoded.endDate && typeof decoded.endDate.toNumber === "function") {
          // Anchor/Borsh BN 타입인 경우
          endDateUnix = decoded.endDate.toNumber();
        } else {
          // 혹시 그냥 number 나 string 인 경우
          endDateUnix = Number(decoded.endDate ?? 0);
        }

        if (!Number.isFinite(endDateUnix)) {
          console.log(
            "⚠️ [API] invalid endDate for account",
            pubkey.toBase58(),
            "raw:",
            decoded.endDate
          );
          // 일단 0(1970년)으로 처리
          endDateUnix = 0;
        }

        const donationAmount =
          decoded.donation_amount ?? decoded.donationAmount ?? 0;

        campaigns.push({
          id: pubkey.toBase58(),
          pubkey: pubkey.toBase58(),
          creator: decoded.creator.toBase58(),
          foundation: decoded.foundation.toBase58(),
          title: decoded.title,
          description: decoded.description,
          goal: Number(decoded.goal),
          donationAmount: Number(donationAmount),
          raised: Number(decoded.raised),
          endDate: endDateUnix, // 🔸 여기! 숫자(초) 그대로 넣기
          complete: decoded.complete,
          failed: decoded.failed,
        });
      } catch (e) {
        console.log(
          "⚠️ [API] decode failed for account",
          pubkey.toBase58(),
          "->",
          (e as Error).message
        );
        continue;
      }
    }


    console.log("✅ [API] decoded campaigns:", campaigns.length);

    return NextResponse.json(
      {
        success: true,
        data: campaigns,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to fetch campaigns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch campaigns",
      },
      { status: 500 }
    );
  }
}
