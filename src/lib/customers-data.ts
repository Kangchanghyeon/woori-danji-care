export type CustomerStatus =
  | "prospect"
  | "proposal"
  | "negotiation"
  | "active";

export type Customer = {
  id: string;
  name: string;
  manager: string;
  phone: string;
  status: CustomerStatus;
  /** 만기 날짜 (MM-DD) */
  expiryDate: string;
  /** 사업자등록번호 (사고 접수 시 템플릿 자동 적용용) */
  businessId?: string;
};

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  prospect: "방문",
  proposal: "견적 제안",
  negotiation: "제출",
  active: "계약 중",
};

export const STATUS_ORDER: CustomerStatus[] = [
  "prospect",
  "proposal",
  "negotiation",
  "active",
];

const STORAGE_KEY = "woori-customers";

export const DUMMY_CUSTOMERS: Customer[] = [
  { id: "1", name: "은마아파트", manager: "김소장", phone: "02-1234-5678", status: "prospect", expiryDate: "03-15", businessId: "" },
  { id: "2", name: "대치자이", manager: "이소장", phone: "02-2345-6789", status: "active", expiryDate: "04-28", businessId: "" },
  { id: "3", name: "래미안대치팰리스", manager: "박소장", phone: "02-3456-7890", status: "proposal", expiryDate: "03-30", businessId: "" },
  { id: "4", name: "도곡렉슬", manager: "최소장", phone: "02-4567-8901", status: "proposal", expiryDate: "04-05", businessId: "" },
  { id: "5", name: "도곡삼성래미안", manager: "정소장", phone: "02-5678-9012", status: "negotiation", expiryDate: "05-10", businessId: "" },
  { id: "6", name: "개포우성", manager: "강소장", phone: "02-6789-0123", status: "negotiation", expiryDate: "06-01", businessId: "" },
  { id: "7", name: "역삼래미안", manager: "조소장", phone: "02-7890-1234", status: "negotiation", expiryDate: "05-20", businessId: "" },
  { id: "8", name: "역삼푸르지오", manager: "윤소장", phone: "02-8901-2345", status: "active", expiryDate: "07-15", businessId: "" },
  { id: "9", name: "테헤란한신", manager: "장소장", phone: "02-9012-3456", status: "active", expiryDate: "08-01", businessId: "" },
  { id: "10", name: "선릉삼성", manager: "한소장", phone: "02-0123-4567", status: "active", expiryDate: "08-20", businessId: "" },
];

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [...DUMMY_CUSTOMERS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DUMMY_CUSTOMERS];
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [...DUMMY_CUSTOMERS];
  } catch {
    return [...DUMMY_CUSTOMERS];
  }
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // ignore
  }
}
