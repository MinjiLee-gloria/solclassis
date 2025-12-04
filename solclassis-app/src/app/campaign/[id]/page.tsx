interface CampaignDetailPageProps {
  params: { id: string };
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = params;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold mb-2">캠페인 상세</h1>
      <p className="text-gray-400 text-sm break-all">
        온체인에서 불러올 캠페인 주소:
        <br />
        <span className="text-pink-400">{id}</span>
      </p>

      <p className="text-gray-300">
        이 페이지에서는 앞으로 다음 정보를 보여줄 예정입니다.
      </p>
      <ul className="list-disc list-inside text-gray-300 space-y-1">
        <li>캠페인 제목, 설명, 목표·모금 금액</li>
        <li>진행 상태 (진행 중 / 완료 / 실패)</li>
        <li>펀딩 참여 / 환불 버튼</li>
        <li>사건 요약, 소송 진행 상황, 공지사항 등</li>
      </ul>

      <p className="text-xs text-gray-500">
        ※ 현재는 구조만 만들어 둔 상태이며, 온체인 데이터 조회 및 UI는 이후 단계에서
        연결됩니다.
      </p>
    </div>
  );
}