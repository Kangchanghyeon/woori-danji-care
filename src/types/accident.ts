/** 접수대기 | 접수완료 | 처리중 */
export type AccidentStatus = "Pending" | "Completed" | "Processing";

export type Accident = {
  id: string;
  apartmentName: string;
  date: string; // ISO date string
  content: string;
  status: AccidentStatus;
  photos: File[] | string[]; // 파일 또는 URL (현재는 UI만)
};

export const ACCIDENT_STATUS_LABEL: Record<AccidentStatus, string> = {
  Pending: "접수대기",
  Completed: "접수완료",
  Processing: "처리중",
};
