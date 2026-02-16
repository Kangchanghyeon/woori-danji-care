"use client";

import { useState, useMemo, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCustomers } from "@/lib/customers-data";
import type { Customer } from "@/lib/customers-data";
import {
  getScheduleEvents,
  saveScheduleEvents,
  SCHEDULE_EVENT_COLORS,
  SCHEDULE_EVENT_COLOR_MAP,
  type ScheduleEvent,
  type ScheduleEventColor,
} from "@/lib/schedule-events";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** MM-DD를 현재 연도의 Date로 변환 */
function expiryToDate(expiryDate: string, year: number): Date {
  const [month, day] = expiryDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [customEvents, setCustomEvents] = useState<ScheduleEvent[]>(() =>
    getScheduleEvents()
  );
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventColor, setNewEventColor] = useState<ScheduleEventColor>("gray");
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    saveScheduleEvents(customEvents);
  }, [customEvents]);

  /** 해당 날짜의 만기 아파트 목록 (currentMonth의 연도 기준) */
  const renewalEventsByDate = useMemo(() => {
    const year = currentMonth.getFullYear();
    const map: Record<string, { apartmentName: string }[]> = {};
    customers.forEach((c) => {
      if (!c.expiryDate) return;
      try {
        const d = expiryToDate(c.expiryDate, year);
        const key = toDateKey(d);
        if (!map[key]) map[key] = [];
        map[key].push({ apartmentName: c.name });
      } catch {
        // invalid expiryDate
      }
    });
    return map;
  }, [customers, currentMonth]);

  /** 해당 날짜의 커스텀 일정 */
  const customEventsByDate = useMemo(() => {
    const map: Record<string, ScheduleEvent[]> = {};
    customEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [customEvents]);

  /** 캘린더에 표시할 날짜들 (6주 기준) */
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [currentMonth]);

  /** 선택한 날짜의 모든 일정 */
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = toDateKey(selectedDate);
    const renewals = (renewalEventsByDate[key] ?? []).map((r) => ({
      type: "renewal" as const,
      label: `${r.apartmentName} 만기`,
    }));
    const customs = (customEventsByDate[key] ?? []).map((e) => ({
      type: "custom" as const,
      label: e.title,
      id: e.id,
      color: e.color ?? "gray",
    }));
    return [...renewals, ...customs];
  }, [
    selectedDate,
    renewalEventsByDate,
    customEventsByDate,
  ]);

  const handleAddEvent = () => {
    const title = newEventTitle.trim();
    if (!title || !selectedDate) return;
    const date = toDateKey(selectedDate);
    setCustomEvents((prev) => [
      ...prev,
      { id: `ev-${Date.now()}`, date, title, color: newEventColor },
    ]);
    setNewEventTitle("");
  };

  const handleRemoveCustomEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
  };

  /** 날짜 셀에 만기 이벤트가 있는지 */
  const hasRenewal = (d: Date) => {
    const key = toDateKey(d);
    const list = renewalEventsByDate[key];
    return list && list.length > 0;
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="page-title">일정</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 왼쪽: 달력 */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <CardTitle className="text-lg">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => subMonths(m, -1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* 요일 헤더 */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
              {WEEKDAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "py-1",
                    i === 0 && "text-red-500",
                    i === 6 && "text-blue-500"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasDot = hasRenewal(day);
                const dayCustomEvents =
                  customEventsByDate[toDateKey(day)] ?? [];

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative flex min-h-[64px] flex-col items-center justify-start rounded-lg border p-2 transition-colors",
                      "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20",
                      isWeekend && isCurrentMonth && "text-slate-600",
                      day.getDay() === 0 && "text-red-600",
                      day.getDay() === 6 && "text-blue-600"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                        isToday(day) && "bg-blue-500 text-white",
                        !isToday(day) && isCurrentMonth && "text-gray-900",
                        !isCurrentMonth && "text-gray-400"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {(hasDot || dayCustomEvents.length > 0) && (
                      <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                        {hasDot && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                            title="보험 만기"
                          />
                        )}
                        {dayCustomEvents.map((ev) => (
                          <span
                            key={ev.id}
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              SCHEDULE_EVENT_COLOR_MAP[ev.color ?? "gray"].dot
                            )}
                            title={ev.title}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 선택한 날짜의 일정 목록 */}
        <Card>
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, "M월 d일 (EEE)", { locale: ko })
                : "날짜를 선택하세요"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-4 py-4">
            {selectedDate && (
              <>
                <div className="min-h-[120px] space-y-2">
                  {selectedDateEvents.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      이날 일정이 없습니다.
                    </p>
                  ) : (
                    selectedDateEvents.map((e) =>
                      e.type === "renewal" ? (
                        <div
                          key={`r-${e.label}`}
                          className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                          <span className="font-medium text-red-800">
                            {e.label}
                          </span>
                        </div>
                      ) : (
                        <div
                          key={e.id}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm",
                            SCHEDULE_EVENT_COLOR_MAP[e.color].bg,
                            SCHEDULE_EVENT_COLOR_MAP[e.color].border
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              SCHEDULE_EVENT_COLOR_MAP[e.color].dot
                            )}
                          />
                          <span className="min-w-0 flex-1 text-gray-800">
                            {e.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-6 px-2 text-gray-500 hover:text-red-600"
                            onClick={() => handleRemoveCustomEvent(e.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      )
                    )
                  )}
                </div>

                <div className="mt-auto border-t pt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    일정 추가
                  </p>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">컬러</span>
                    {SCHEDULE_EVENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewEventColor(c)}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                          SCHEDULE_EVENT_COLOR_MAP[c].dot,
                          newEventColor === c
                            ? "border-gray-800 ring-2 ring-offset-1 ring-gray-400"
                            : "border-transparent"
                        )}
                        title={c}
                        aria-label={`색상 ${c} 선택`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="예: 점심 약속"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), handleAddEvent())
                      }
                    />
                    <Button
                      size="default"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={handleAddEvent}
                      disabled={!newEventTitle.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      일정 추가
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
