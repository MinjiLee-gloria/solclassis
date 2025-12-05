// app/campaign/[pubkey]/page.tsx
/**
 * TECH-DEBT / REFACTOR NOTE (MVP 끝나고 할 일)
 *
 * 1) 이 페이지는 현재 전체가 클라이언트 컴포넌트임.
 *    - 추후:
 *      - page.tsx -> 서버 컴포넌트로 전환
 *      - ClientCampaignDetail.tsx (client)로 분리
 *      - 서버에서 캠페인 데이터 prefetch + SEO 개선
 *
 * 2) 온체인 로직
 *    - donateOnChain / createCampaignOnChain 등을 공통 utils로 정리
 *    - Anchor Program methods 기반 코드로 리팩토링 (program.methods...)
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Wallet as AnchorWallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { donateOnChain } from "@/utils/donate";

type Campaign = {
  pubkey: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  donationAmount: number;
  endDate: number; // unix timestamp (초 단위)
  complete: boolean;
  failed: boolean;
};

export default function CampaignPage() {
  // 1) URL 에서 [pubkey] 부분 읽기
  const params = useParams<{ pubkey: string }>();
  const pubkey = params?.pubkey as string;

  const { connection } = useConnection();
  const wallet = useWallet();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);            // 캠페인 로딩
  const [error, setError] = useState<string | null>(null); // 캠페인 로딩 에러

  const [donateLoading, setDonateLoading] = useState(false);      // 기부 트랜잭션 로딩
  const [donateError, setDonateError] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const isWalletConnected = !!wallet.publicKey;

  // 2) /api/campaigns 에서 해당 pubkey 캠페인 가져오기
  const loadCampaign = useCallback(async () => {
    if (!pubkey) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/campaigns", { cache: "no-store" });

      if (!res.ok) {
        throw new Error("캠페인 목록을 불러오지 못했습니다.");
      }

      const body = await res.json();
      // body 구조(structure): { success: boolean, data?: Campaign[] }
      const list = (body as any).data as any[];

      // API 쪽에서 id = 캠페인 주소(pubkey)로 내려주고 있으니까
      const found = list.find((c) => c.id === pubkey);

      if (!found) {
        setError("해당 캠페인을 찾을 수 없습니다.");
        setCampaign(null);
      } else {
        // API 구조 → 이 페이지에서 쓰는 구조로 맞추기
        const endDateStr = found.endDate as string; // "YYYY-MM-DD"
        const endDateUnix =
          endDateStr && endDateStr.length >= 10
            ? Math.floor(new Date(endDateStr + "T00:00:00Z").getTime() / 1000)
            : 0;

        setCampaign({
          pubkey,
          title: found.title ?? "",
          description: found.description ?? "",
          goal: Number(found.goal ?? 0),
          raised: Number(found.raised ?? 0),
          donationAmount: Number(found.donationAmount ?? 0),
          endDate: endDateUnix,
          complete: Boolean(found.complete),
          failed: Boolean(found.failed),
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [pubkey]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  // 3) 기부 버튼 클릭 핸들러
  const handleDonate = async () => {
    if (!campaign) return;

    if (!wallet.publicKey || !wallet.signTransaction) {
      setDonateError("지갑이 연결되어 있지 않거나, 서명 기능이 없습니다.");
      return;
    }

    setDonateLoading(true);
    setDonateError(null);
    setTxSig(null);

    try {
      const provider = new AnchorProvider(
        connection,
        wallet as unknown as AnchorWallet,
        { commitment: "confirmed" }
      );

      const sig = await donateOnChain(
        provider,
        new PublicKey(campaign.pubkey),
        wallet.publicKey,
        campaign.donationAmount, 
      );

      setTxSig(sig);

      // 온체인 raised 값 반영 위해 다시 캠페인 데이터 로딩
      await loadCampaign();
    } catch (e: any) {
      console.error(e);
      setDonateError(e?.message ?? "트랜잭션 실패");
    } finally {
      setDonateLoading(false);
    }
  };

  // 4) 로딩 화면
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-white">
        <h1 className="text-2xl font-bold mb-4">캠페인 상세</h1>
        <p className="text-gray-400 text-sm">캠페인 정보를 불러오는 중입니다…</p>
      </div>
    );
  }

  // 5) 에러 화면
  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-white">
        <h1 className="text-2xl font-bold mb-4">캠페인 상세</h1>
        <p className="text-red-400 text-sm mb-2">
          {error ?? "캠페인을 찾을 수 없습니다."}
        </p>
        {pubkey && (
          <p className="text-gray-400 text-xs break-all">
            캠페인 주소:
            <br />
            <span className="text-pink-400">{pubkey}</span>
          </p>
        )}
      </div>
    );
  }

  // 6) 정상 데이터 화면
  const progress =
    campaign.goal > 0 ? Math.min(100, (campaign.raised / campaign.goal) * 100) : 0;

  let statusLabel = "진행 중";
  let statusColor = "bg-blue-500";

  if (campaign.failed) {
    statusLabel = "실패";
    statusColor = "bg-red-500";
  } else if (campaign.complete || campaign.raised >= campaign.goal) {
    statusLabel = "성공";
    statusColor = "bg-green-500";
  }

  const endDate = new Date(campaign.endDate * 1000); // 초 → 밀리초

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>

      <div className="flex flex-col gap-2 mb-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
            {statusLabel}
          </span>
          <span className="truncate">
            캠페인 주소:&nbsp;
            <span className="text-pink-400 break-all">{pubkey}</span>
          </span>
        </div>
        <div className="text-xs text-gray-500">
          종료일: {endDate.toLocaleString("ko-KR")}
        </div>
      </div>

      <p className="text-gray-200 whitespace-pre-line mb-6">
        {campaign.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="bg-zinc-900/70 rounded-xl p-4">
          <div className="text-gray-400 mb-1">목표 금액</div>
          <div className="font-semibold">{campaign.goal} lamports</div>
        </div>
        <div className="bg-zinc-900/70 rounded-xl p-4">
          <div className="text-gray-400 mb-1">모금된 금액</div>
          <div className="font-semibold">{campaign.raised} lamports</div>
        </div>
        <div className="bg-zinc-900/70 rounded-xl p-4">
          <div className="text-gray-400 mb-1">기부 단위 금액</div>
          <div className="font-semibold">
            {campaign.donationAmount} lamports
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>진행률</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-3 bg-pink-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 지갑 안내 / 에러 / Tx 표시 */}
      {!isWalletConnected && (
        <p className="text-xs text-yellow-400 mb-2">
          지갑을 연결하시면 기부하실 수 있어요.
        </p>
      )}

      {donateError && (
        <p className="text-xs text-red-400 mb-2">
          ⚠️ {donateError}
        </p>
      )}

      {txSig && (
        <p className="text-xs text-emerald-400 mb-2 break-all">
          ✅ 기부 완료! Tx: {txSig}
        </p>
      )}

      {/* 기부 버튼 */}
      <button
        className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isWalletConnected || donateLoading}
        onClick={handleDonate}
      >
        {donateLoading ? "트랜잭션 전송 중…" : "기부하기"}
      </button>
    </div>
  );
}
