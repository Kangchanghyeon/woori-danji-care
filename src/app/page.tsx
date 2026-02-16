import Link from "next/link";
import { Shield } from "lucide-react";

export default function Home() {
  return (
    <div
      className="flex min-h-screen items-center justify-center font-sans antialiased"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <main className="flex flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        {/* 로고: 방패 아이콘 + 우리단지케어 */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield
              className="h-10 w-10 shrink-0"
              style={{ color: "#1E3A8A" }}
              aria-hidden
            />
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>
              우리단지케어
            </h1>
          </div>
          <p className="text-base font-medium text-gray-600">
            아파트 화재보험 전문 관리 솔루션
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/planner"
            className="inline-flex min-w-[180px] items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] [&:hover]:bg-[#172554]"
            style={{ backgroundColor: "#1E3A8A" }}
          >
            담당자 로그인
          </Link>
          <Link
            href="/client"
            className="inline-flex min-w-[180px] items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] [&:hover]:bg-[#059669]"
            style={{ backgroundColor: "#10B981" }}
          >
            관리사무소 로그인
          </Link>
        </div>
      </main>
    </div>
  );
}
