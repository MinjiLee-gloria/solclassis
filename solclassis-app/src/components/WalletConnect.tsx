"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// WalletMultiButton을 클라이언트에서만 로드하도록 설정
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  // 브라우저에 마운트된 뒤에만 렌더링
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 서버 렌더링 시 / 첫 마운트 전에는 아무것도 그리지 않음
    return null;
  }

  return (
    <div className="flex items-center justify-end">
      <WalletMultiButtonDynamic />
    </div>
  );
}
