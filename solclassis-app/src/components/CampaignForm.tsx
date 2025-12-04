"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createCampaignOnChain } from "@/utils/createCampaign";

export default function CampaignForm() {
  const { connected, wallet } = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState(""); // SOL 단위
  const [donationAmount, setDonationAmount] = useState(""); // SOL 단위
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!connected || !wallet?.adapter) {
      setError("지갑을 먼저 연결해주세요.");
      return;
    }

    const goalNum = Number(goal);
    const donationNum = Number(donationAmount);

    if (!goalNum || goalNum <= 0) {
      setError("목표 금액을 올바르게 입력해주세요.");
      return;
    }

    if (!donationNum || donationNum <= 0) {
      setError("기부 단위 금액을 올바르게 입력해주세요.");
      return;
    }

    if (!endDate) {
      setError("캠페인 종료일을 선택해주세요.");
      return;
    }

    const endDateObj = new Date(`${endDate}T00:00:00`);

    try {
      setLoading(true);

      const result = await createCampaignOnChain(wallet.adapter, {
        title,
        description,
        goalSol: goalNum,
        donationSol: donationNum,
        endDate: endDateObj,
      });

      setMessage(
        `✅ 캠페인이 생성되었습니다.\nTX: ${result.txSig}\nCampaign: ${result.campaignPubkey}`
      );

      // 폼 초기화
      setTitle("");
      setDescription("");
      setGoal("");
      setDonationAmount("");
      setEndDate("");
    } catch (err: any) {
      console.error("❌ Error creating campaign:", err);
      setError(err.message || "캠페인 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900/60 rounded-lg shadow-md border border-gray-800 mb-10">
      <h2 className="text-2xl font-bold mb-4">새 캠페인 만들기</h2>

      {!connected && (
        <div className="mb-4 p-3 text-sm rounded border border-yellow-600 bg-yellow-900/20 text-yellow-100">
          지갑이 연결되어 있지 않습니다. 우측 상단의 지갑 버튼을 눌러
          Phantom 지갑을 연결한 후 캠페인을 생성할 수 있습니다.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-sm">
            캠페인 제목
          </label>
          <input
            type="text"
            className="w-full p-2 bg-gray-800 rounded-md text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: OO 거래소 상장폐지 집단소송"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-sm">
            캠페인 설명
          </label>
          <textarea
            className="w-full p-2 bg-gray-800 rounded-md text-sm min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="사건의 개요, 목적, 예상 진행 방향 등을 간단히 적어주세요."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-sm">
              목표 금액 (SOL)
            </label>
            <input
              type="number"
              className="w-full p-2 bg-gray-800 rounded-md text-sm"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              min={0}
              step={0.01}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm">
              기부 단위 금액 (SOL)
            </label>
            <input
              type="number"
              className="w-full p-2 bg-gray-800 rounded-md text-sm"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              min={0}
              step={0.01}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm">
              종료일
            </label>
            <input
              type="date"
              className="w-full p-2 bg-gray-800 rounded-md text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 p-2 rounded-md text-sm font-semibold mt-2"
          disabled={loading || !connected}
        >
          {loading ? "캠페인 생성 중..." : "캠페인 생성하기"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 text-sm rounded border border-red-600 bg-red-900/20 text-red-100 whitespace-pre-line">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 text-sm rounded border border-emerald-600 bg-emerald-900/20 text-emerald-100 whitespace-pre-line">
          {message}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        ※ 현재는 Solana devnet에서 테스트 중입니다. 실제 메인넷 펀딩 전에는
        별도의 안내와 검증 절차가 추가됩니다.
      </p>
    </div>
  );
}