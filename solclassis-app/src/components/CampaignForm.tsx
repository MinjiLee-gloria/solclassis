// src/components/CampaignForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { createCampaignOnChain } from "@/utils/createCampaign";
import { useRouter } from "next/navigation";

export default function CampaignForm() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const router = useRouter();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(""); // SOL 단위로 입력받고, 나중에 lamports로 변환해도 됨
  const [donationAmount, setDonationAmount] = useState("");
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!wallet.publicKey) {
      setError("지갑이 연결되어 있지 않습니다. 상단에서 Phantom 지갑을 먼저 연결해 주세요.");
      return;
    }

    // 숫자 변환
    const goalNum = Number(goal);
    const donationNum = Number(donationAmount);

    if (!goalNum || !donationNum) {
      setError("목표 금액과 기부 단위 금액을 숫자로 입력해 주세요.");
      return;
    }

    if (donationNum <= 0) {
      setError("기부 단위 금액은 0보다 커야 합니다.");
      return;
    }

    if (goalNum % donationNum !== 0) {
      setError("목표 금액은 기부 단위 금액으로 딱 나누어떨어져야 합니다.");
      return;
    }

    if (!endDate) {
      setError("캠페인 종료일을 선택해 주세요.");
      return;
    }

    // 날짜를 unix timestamp(초)로 변환
    const endTs = Math.floor(new Date(endDate + "T23:59:59Z").getTime() / 1000);

    try {
      setLoading(true);

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });

      const { txSig, campaignPubkey } = await createCampaignOnChain(
        provider,
        wallet.publicKey,
        {
          title,
          description,
          // 지금은 lamports 단위로 바로 보낼게 (원하면 여기서 *LAMPORTS_PER_SOL 해도 됨)
          goal: goalNum,
          donationAmount: donationNum,
          endDate: endTs,
        },
      );

      setSuccessMsg(
        [
          "✅ 캠페인이 성공적으로 생성되었습니다.",
          `트랜잭션: ${txSig}`,
          `캠페인 주소: ${campaignPubkey.toBase58()}`,
        ].join("\n"),
      );

      // 폼 초기화
      setTitle("");
      setDescription("");
      setGoal("");
      setDonationAmount("");
      setEndDate("");

      // 메인 캠페인 리스트 다시 불러오기 (SSR/Route Handler라면)
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">캠페인 제목</label>
        <input
          className="w-full rounded border px-3 py-2 text-sm bg-black/40 border-white/10"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: ㅇㅇ 사건 집단소송 비용 모금"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          className="w-full rounded border px-3 py-2 text-sm bg-black/40 border-white/10 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="사건 개요, 소송 진행 계획, 재단 계좌 정보 등을 간단히 적어주세요. (500자 이내)"
          maxLength={500}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">목표 금액</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 text-sm bg-black/40 border-white/10"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="예: 1000000000"
            required
          />
          <p className="mt-1 text-[11px] text-white/50">
            (지금은 lamports 단위로 입력, 나중에 SOL 변환 UI 붙일 수 있음)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">기부 단위 금액</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2 text-sm bg-black/40 border-white/10"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="예: 100000000"
            required
          />
          <p className="mt-1 text-[11px] text-white/50">
            (모든 기부는 이 금액 단위로만 참여 가능)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">캠페인 종료일</label>
        <input
          type="date"
          className="w-full rounded border px-3 py-2 text-sm bg-black/40 border-white/10"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="text-xs text-emerald-400 whitespace-pre-wrap">
          {successMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md px-4 py-2 text-sm font-semibold bg-pink-600 disabled:opacity-50"
      >
        {loading ? "캠페인 생성 중..." : "캠페인 생성"}
      </button>
    </form>
  );
}
