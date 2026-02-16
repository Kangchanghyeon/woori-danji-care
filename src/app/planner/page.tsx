"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Lock, Printer, Send } from "lucide-react";
import { HunterMap } from "@/components/HunterMap";
import { AccidentReportTemplate } from "@/components/AccidentReportTemplate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccidents } from "@/contexts/AccidentContext";
import { ACCIDENT_STATUS_LABEL } from "@/types/accident";
import { getScheduleEvents } from "@/lib/schedule-events";
import { getCustomers } from "@/lib/customers-data";
import type { Accident, AccidentStatus } from "@/types/accident";
import {
  DUMMY_APARTMENTS,
  type DummyApartment,
} from "@/data/dummyApartments";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceMeters, RADIUS_KM } from "@/lib/geo-utils";
import {
  getLocationLabel,
  getWeatherEncouragementMessage,
} from "@/lib/weather-message";
import { cn } from "@/lib/utils";

/** **텍스트** 구간을 <strong>으로 렌더링 */
function renderMessageWithBold(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
  );
}

/** 신규 사고 접수만 해당 (보험 견적 접수, 담당자 연락 요청 제외) */
const isAccidentRequest = (content: string) =>
  !content.startsWith("보험 견적 접수") && !content.startsWith("담당자 연락 요청");

const REQUEST_PAGE_SIZE = 5;

export default function PlannerDashboardPage() {
  /** 구독 상태 (나중에 DB 연동 예정) - 당분간 무료 개방 */
  const isPremium = true;

  const { lat: userLat, lng: userLng, loading: locationLoading } = useGeolocation();
  const userCenter =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  /** 날씨·시간대 기반 맞춤형 문구 (페이지 로드 시 1회) */
  const encouragementMessage = useMemo(
    () => getWeatherEncouragementMessage(),
    []
  );

  const { accidents, updateStatus } = useAccidents();
  const pendingCount = accidents.filter((a) => a.status === "Pending").length;
  const processingCount = accidents.filter((a) => a.status === "Processing").length;
  const completedCount = accidents.filter((a) => a.status === "Completed").length;
  const pendingAccidentCount = accidents.filter(
    (a) => a.status === "Pending" && isAccidentRequest(a.content)
  ).length;

  /** 영업용 지도용 아파트 목록: 계약 중(active)은 날짜 무관 초록색, 나머지는 D-60/D-90/만기여유. 내 위치 있을 때 반경 3km 이내만 표시 */
  const hunterMapApartments = useMemo((): DummyApartment[] => {
    const customers = getCustomers();
    const activeNames = new Set(
      customers.filter((c) => c.status === "active").map((c) => c.name)
    );
    let list = DUMMY_APARTMENTS.map((apt) =>
      activeNames.has(apt.name)
        ? { ...apt, pinType: "green" as const, label: "계약 중" }
        : apt
    );
    if (userLat != null && userLng != null) {
      const radiusM = RADIUS_KM * 1000;
      list = list.filter(
        (apt) =>
          distanceMeters(userLat, userLng, apt.lat, apt.lng) <= radiusM
      );
    }
    return list;
  }, [userLat, userLng]);

  /** 오늘 날짜에 등록된 일정 수 (커스텀 일정 + 만기 아파트) */
  const todayScheduleCount = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const scheduleEvents = getScheduleEvents();
    const customers = getCustomers();
    const customCount = scheduleEvents.filter((e) => e.date === todayKey).length;
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const renewalCount = customers.filter((c) => {
      if (!c.expiryDate) return false;
      const [m, d] = c.expiryDate.split("-").map(Number);
      return m === todayMonth && d === todayDay;
    }).length;
    return customCount + renewalCount;
  }, []);

  /** 계약 중(active)인 단지 중 만기 60일 이내 목록 (관리 단지 지도 노란색과 동일 기준) */
  const expiryWithin60DaysList = useMemo(() => {
    const today = new Date();
    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
    const activeNames = new Set(
      getCustomers()
        .filter((c) => c.status === "active")
        .map((c) => c.name)
    );
    return DUMMY_APARTMENTS.filter((apt) => activeNames.has(apt.name))
      .filter((apt) => {
        const [m, d] = apt.renewalDate.split("-").map(Number);
        const renewalDate = new Date(today.getFullYear(), m - 1, d);
        if (renewalDate < today) {
          renewalDate.setFullYear(today.getFullYear() + 1);
        }
        return renewalDate <= sixtyDaysLater;
      })
      .map((apt) => ({ name: apt.name, renewalDate: apt.renewalDate }));
  }, []);

  const expiryWithin60DaysCount = expiryWithin60DaysList.length;

  const [todayWorkInfoOpen, setTodayWorkInfoOpen] = useState(false);
  const [expiry60DialogOpen, setExpiry60DialogOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  const [requestPage, setRequestPage] = useState(0);
  const reportPrintRef = useRef<HTMLDivElement>(null);

  const totalRequestPages = Math.max(
    1,
    Math.ceil(accidents.length / REQUEST_PAGE_SIZE)
  );
  const paginatedAccidents = accidents.slice(
    requestPage * REQUEST_PAGE_SIZE,
    requestPage * REQUEST_PAGE_SIZE + REQUEST_PAGE_SIZE
  );

  useEffect(() => {
    if (requestPage >= totalRequestPages && totalRequestPages > 0) {
      setRequestPage(totalRequestPages - 1);
    }
  }, [accidents.length, requestPage, totalRequestPages]);

  /** 고객 카드에 등록된 사업자번호 우선, 없으면 DUMMY_APARTMENTS */
  const businessIdFor = (apartmentName: string) => {
    const customer = getCustomers().find((c) => c.name === apartmentName);
    if (customer?.businessId?.trim()) return customer.businessId.trim();
    return DUMMY_APARTMENTS.find((a) => a.name === apartmentName)?.businessId ?? "-";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFaxClick = () => {
    if (!isPremium) {
      toast.info("프리미엄 플랜이 필요합니다");
      return;
    }
    toast.success("보험사로 사고 접수가 완료되었습니다.");
  };

  return (
    <div className="p-4 md:p-6">
      {/* 날씨 기반 맞춤형 문구 */}
      <section className="mb-6">
        <Card className="border-gray-200 bg-gradient-to-r from-sky-50 to-indigo-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-gray-600">
              {locationLoading
                ? "위치 정보를 불러오는 중이에요."
                : getLocationLabel(userLat, userLng)}
            </p>
            <p className="mt-2 font-medium text-gray-800">
              {renderMessageWithBold(encouragementMessage)}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 상단 요약 카드 */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setTodayWorkInfoOpen(true)}
          className="cursor-pointer rounded-lg border-2 border-red-200 bg-red-50 p-4 font-medium text-red-700 text-left transition-opacity hover:opacity-90 [&_.num]:text-red-600"
        >
          <div className="text-sm">오늘 업무</div>
          <div className="num mt-1 text-2xl font-bold">
            {pendingCount + processingCount + todayScheduleCount}건
          </div>
          <span className="mt-1 block text-xs opacity-80">클릭하면 설명 보기</span>
        </button>
        <Dialog open={todayWorkInfoOpen} onOpenChange={setTodayWorkInfoOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>오늘 업무란?</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong className="text-gray-800">접수대기</strong>와{" "}
                <strong className="text-gray-800">처리중</strong>인 요청 건수를
                합친 수입니다. 접수 완료된 건은 제외됩니다.
              </p>
              <ul className="list-inside list-disc space-y-1 rounded-md bg-gray-50 p-3">
                <li>접수대기: {pendingCount}건</li>
                <li>처리중: {processingCount}건</li>
                <li>오늘 일정: {todayScheduleCount}건</li>
              </ul>
              <p className="text-xs text-gray-500">
                오늘 일정(일정 페이지에서 추가한 일정 + 오늘 만기 아파트)도 포함됩니다.
              </p>
            </div>
          </DialogContent>
        </Dialog>
        <SummaryCard
          title="신규 사고"
          count={pendingAccidentCount}
          accent="orange"
        />
        <button
          type="button"
          onClick={() => setExpiry60DialogOpen(true)}
          className="cursor-pointer rounded-lg border-2 border-green-200 bg-green-50 p-4 font-medium text-green-700 text-left transition-opacity hover:opacity-90 [&_.num]:text-green-600"
        >
          <div className="text-sm">60일 이내 만기건</div>
          <div className="num mt-1 text-2xl font-bold">
            {expiryWithin60DaysCount}건
          </div>
          <span className="mt-1 block text-xs opacity-80">
            클릭하여 목록 보기
          </span>
        </button>
        <Dialog open={expiry60DialogOpen} onOpenChange={setExpiry60DialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>60일 이내 만기건</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {expiryWithin60DaysList.length === 0 ? (
                <p className="py-4 text-sm text-gray-500">
                  해당하는 단지가 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {expiryWithin60DaysList.map(({ name, renewalDate }) => {
                    const [m, d] = renewalDate.split("-").map(Number);
                    const dateLabel = `${m}월 ${d}일`;
                    return (
                      <li
                        key={name}
                        className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-gray-800">{name}</span>
                        <span className="text-gray-600">{dateLabel}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* 아파트 요청 내역 (업무 우선) */}
      <section className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 px-4 py-3 text-lg font-semibold text-gray-800">
          아파트 요청 내역
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">접수일</TableHead>
                <TableHead className="px-4 py-3">아파트명</TableHead>
                <TableHead className="px-4 py-3">요청 내역</TableHead>
                <TableHead className="px-4 py-3">상태</TableHead>
                <TableHead className="w-[120px] px-4 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accidents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    요청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccidents.map((accident) => (
                  <AccidentTableRow
                    key={accident.id}
                    accident={accident}
                    onConfirm={() => updateStatus(accident.id, "Completed")}
                    onRowClick={() =>
                      isAccidentRequest(accident.content) &&
                      setSelectedAccident(accident)
                    }
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {accidents.length > REQUEST_PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-600">
              전체 {accidents.length}건 중{" "}
              {requestPage * REQUEST_PAGE_SIZE + 1}–
              {Math.min(
                requestPage * REQUEST_PAGE_SIZE + REQUEST_PAGE_SIZE,
                accidents.length
              )}
              건
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={requestPage === 0}
                onClick={() => setRequestPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {requestPage + 1} / {totalRequestPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={requestPage >= totalRequestPages - 1}
                onClick={() =>
                  setRequestPage((p) => Math.min(totalRequestPages - 1, p + 1))
                }
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* 영업용 지도 (Hunter Map) - Paywall when !isPremium */}
      <section className="relative">
        <h2 className="mb-3 text-xl font-bold text-slate-900">
          주변 단지 만기파악
        </h2>
        <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "#22C55E" }}
            />
            계약 중
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            D-60 이내
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            D-90 이내
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-gray-400" />
            만기 여유
          </span>
        </div>
        <div
          className={cn(
            "relative h-[400px] w-full overflow-hidden rounded-lg border border-gray-200",
            !isPremium && "pointer-events-none select-none"
          )}
        >
          <div
            className={cn(
              "h-full w-full",
              !isPremium && "blur-md grayscale"
            )}
          >
            <HunterMap
              className="h-full w-full"
              apartments={hunterMapApartments}
              center={userCenter ?? undefined}
            />
          </div>
          {!isPremium && (
            <div
              className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/50"
              aria-hidden={false}
            >
              <div className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Lock className="h-6 w-6" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-slate-800">
                    프리미엄 플랜 전용 기능입니다
                  </p>
                  <p className="mb-5 text-sm text-slate-600">
                    우리 동네 재계약 임박 아파트를 지도에서 바로 확인하세요.
                  </p>
                  <Button
                    className="w-full bg-blue-600 font-medium text-white hover:bg-blue-700"
                    onClick={() => alert("결제 페이지로 이동")}
                  >
                    월 29,000원에 잠금 해제
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 사고 상세 / 경위서 미리보기 모달 */}
      <Dialog
        open={!!selectedAccident}
        onOpenChange={(open) => !open && setSelectedAccident(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-[210mm] overflow-y-auto print:max-h-none print:max-w-none">
          <DialogHeader>
            <DialogTitle>사고 접수 확인서</DialogTitle>
          </DialogHeader>
          {selectedAccident && (
            <>
              <div
                ref={reportPrintRef}
                className="accident-report-print print:block"
              >
                <AccidentReportTemplate
                  apartmentName={selectedAccident.apartmentName}
                  businessId={businessIdFor(selectedAccident.apartmentName)}
                  accidentDate={selectedAccident.date}
                  location={selectedAccident.apartmentName}
                  description={selectedAccident.content}
                  photoUrls={selectedAccident.photos.filter(
                    (p): p is string => typeof p === "string"
                  )}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4 print:hidden">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4" />
                  인쇄 / PDF 저장
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleFaxClick}
                >
                  <Send className="h-4 w-4" />
                  보험사로 사고 접수
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccidentTableRow({
  accident,
  onConfirm,
  onRowClick,
}: {
  accident: Accident;
  onConfirm: () => void;
  onRowClick: () => void;
}) {
  const isPending = accident.status === "Pending";
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onRowClick}
    >
      <TableCell className="px-4 py-3 text-muted-foreground">
        {new Date(accident.date).toLocaleString("ko-KR")}
      </TableCell>
      <TableCell className="px-4 py-3 font-medium">
        {accident.apartmentName}
      </TableCell>
      <TableCell className="px-4 py-3 text-muted-foreground">
        {accident.content.length > 15
          ? `${accident.content.slice(0, 15)}…`
          : accident.content}
      </TableCell>
      <TableCell className="px-4 py-3">
        <StatusBadge status={accident.status} />
      </TableCell>
      <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {isPending && (
          <Button
            size="sm"
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
            onClick={onConfirm}
          >
            접수 확인
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: AccidentStatus }) {
  return (
    <Badge
      variant={status === "Pending" ? "secondary" : "default"}
      className={cn(
        status === "Completed" &&
          "border-green-200 bg-green-100 text-green-800 hover:bg-green-100",
        status === "Processing" &&
          "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50"
      )}
    >
      {ACCIDENT_STATUS_LABEL[status]}
    </Badge>
  );
}

function SummaryCard({
  title,
  subtitle,
  count,
  accent,
}: {
  title: string;
  subtitle?: string;
  count: number;
  accent: "red" | "orange" | "green";
}) {
  const styles = {
    red: "border-red-200 bg-red-50 text-red-700 [&_.num]:text-red-600",
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 [&_.num]:text-orange-600",
    green:
      "border-green-200 bg-green-50 text-green-700 [&_.num]:text-green-600",
  };
  return (
    <div
      className={`rounded-lg border-2 p-4 font-medium ${styles[accent]}`}
    >
      <div className="text-sm">{title}</div>
      {subtitle && (
        <div className="text-xs opacity-90">{subtitle}</div>
      )}
      <div className="num mt-1 text-2xl font-bold">{count}건</div>
    </div>
  );
}
