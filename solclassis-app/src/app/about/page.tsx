export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold mb-2">SOLCLASSIS 소개</h1>
      <p className="text-gray-300 leading-relaxed">
        SOLCLASSIS는 집단소송·공익소송을 보다 투명하고 효율적으로 운영하기 위한
        온체인 크라우드펀딩 플랫폼입니다.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">왜 SOLCLASSIS인가?</h2>
        <p className="text-gray-300 leading-relaxed">
          대형 사건의 피해자들은 정보 비대칭, 소송 비용, 시간 부족 등으로 인해
          정당한 권리를 행사하기 어렵습니다. SOLCLASSIS는 캠페인 주최자가
          선별한 사건에 대해,
          <br />
          <span className="text-pink-400">
            · 모금 내역과 집행 과정을 온체인에 기록하고
          </span>
          <br />
          <span className="text-pink-400">
            · 참여자·후원자가 신뢰할 수 있는 구조를 만드는 것
          </span>
          을 목표로 합니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">역할 구분</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>
            <span className="font-semibold text-white">SOLCLASSIS 운영자</span>:
            사건을 선별하고, 로펌·재단과 협업하여 공식 캠페인을 개설합니다.
          </li>
          <li>
            <span className="font-semibold text-white">캠페인 참여자</span>:
            사건 관련 정보 제공, 위임 절차 참여, 커뮤니티 의견 제시.
          </li>
          <li>
            <span className="font-semibold text-white">후원자</span>:
            공익 소송·집단소송의 진행을 위해 투명한 방식으로 펀딩에 참여합니다.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">앞으로의 로드맵</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Solana 지갑 연결 및 온체인 펀딩 기능 연동</li>
          <li>캠페인별 상세 페이지 및 진행 상황 대시보드</li>
          <li>로펌·재단과의 협업 구조 및 집행 리포트 템플릿</li>
        </ul>
      </section>
    </div>
  );
}