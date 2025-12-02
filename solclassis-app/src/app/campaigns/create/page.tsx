"use client";

import { useState } from "react";

export default function CreateCampaign() {
  // 폼 입력 상태 관리
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 요청 상태 및 피드백 메시지 관리
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // POST 요청을 통해 캠페인 생성 API 호출
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          goal: Number(goal),
          endDate: Number(endDate),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ 캠페인이 생성되었습니다! TX: ${data.transaction}`);
        // 필요한 경우 폼 리셋 등 추가 작업 수행
      } else {
        setMessage(`❌ 오류: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ 캠페인 생성 실패");
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">캠페인 생성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">캠페인 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">캠페인 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1 font-semibold">목표 금액 (SOL)</label>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">종료일 (UNIX 타임스탬프)</label>
          <input
            type="number"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "생성 중..." : "캠페인 생성"}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
