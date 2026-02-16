"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  Users,
  FileWarning,
  Calendar,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/planner", label: "대시보드", icon: LayoutDashboard },
  { href: "/planner/schedule", label: "일정", icon: Calendar },
  { href: "/planner/customers", label: "고객 관리", icon: Users },
  { href: "/planner/claims", label: "사고 접수", icon: FileWarning },
  { href: "/planner/map", label: "관리 단지 지도", icon: MapPin },
];

export function PlannerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside
      className="group flex w-56 flex-col overflow-hidden bg-[#1E3A8A] text-white transition-[width] duration-200 ease-out md:w-[4.5rem] md:hover:w-64"
      style={{ minHeight: "100vh" }}
    >
      {/* 로고 */}
      <div className="border-b border-white/10 p-3">
        <Link
          href="/planner"
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-xl font-bold tracking-tight md:px-0 md:group-hover:justify-start md:group-hover:px-3"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center md:group-hover:w-10 md:group-hover:justify-start">
            <Shield className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 truncate whitespace-nowrap md:max-w-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-200 md:group-hover:max-w-[12rem] md:group-hover:opacity-100">
            우리단지케어
          </span>
        </Link>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={label}
              className={`flex items-center justify-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors md:px-0 md:group-hover:justify-start md:group-hover:px-3 ${
                isActive
                  ? "border-blue-300 bg-blue-400/30 text-white"
                  : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center md:group-hover:w-10 md:group-hover:justify-start">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 truncate whitespace-nowrap md:max-w-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-200 md:group-hover:max-w-[10rem] md:group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          title="로그아웃"
          className="flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white md:px-0 md:group-hover:justify-start md:group-hover:px-3"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center md:group-hover:w-10 md:group-hover:justify-start">
            <LogOut className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 truncate whitespace-nowrap md:max-w-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-200 md:group-hover:max-w-[10rem] md:group-hover:opacity-100">
            로그아웃
          </span>
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* 모바일: 햄버거 버튼 */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="text-lg font-bold text-[#1E3A8A]">우리단지케어</span>
        <div className="w-10" />
      </div>

      {/* 모바일: 오버레이 + 슬라이드 사이드바 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-56 transform transition-transform md:relative md:inset-auto md:z-0 md:flex md:w-auto md:flex-none md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>
    </>
  );
}
