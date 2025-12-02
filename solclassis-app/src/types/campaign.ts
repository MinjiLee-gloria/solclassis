export interface Campaign {
    id: string;           // 캠페인 PublicKey (string으로 변환)
    creator: string;      // 생성자 PublicKey (string으로 변환)
    foundation: string;   // 재단 PublicKey (string으로 변환)
    title: string;        // 캠페인 제목
    description: string;  // 캠페인 설명
    goal: number;         // 목표 금액 (SOL 단위로 변환)
    donationAmount: number; // 기부 단위 금액 (SOL 단위로 변환)
    raised: number;       // 모금된 금액 (SOL 단위로 변환)
    endDate: string;      // 종료 날짜 (YYYY-MM-DD 형식)
    complete: boolean;    // 완료 여부
    failed: boolean;      // 실패 여부
  }