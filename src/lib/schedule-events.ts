/** 커스텀 일정용 컬러 (만기는 빨간점으로 고정) */
export type ScheduleEventColor =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "gray";

export const SCHEDULE_EVENT_COLORS: ScheduleEventColor[] = [
  "blue",
  "green",
  "yellow",
  "purple",
  "gray",
];

export const SCHEDULE_EVENT_COLOR_MAP: Record<
  ScheduleEventColor,
  { bg: string; dot: string; border: string }
> = {
  blue: { bg: "bg-blue-50", dot: "bg-blue-500", border: "border-blue-200" },
  green: { bg: "bg-green-50", dot: "bg-green-500", border: "border-green-200" },
  yellow: { bg: "bg-amber-50", dot: "bg-amber-500", border: "border-amber-200" },
  purple: { bg: "bg-violet-50", dot: "bg-violet-500", border: "border-violet-200" },
  gray: { bg: "bg-gray-50", dot: "bg-gray-500", border: "border-gray-200" },
};

export type ScheduleEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  /** 커스텀 일정 컬러. 없으면 gray */
  color?: ScheduleEventColor;
};

const STORAGE_KEY = "woori-schedule-events";

export function getScheduleEvents(): ScheduleEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScheduleEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScheduleEvents(events: ScheduleEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}
