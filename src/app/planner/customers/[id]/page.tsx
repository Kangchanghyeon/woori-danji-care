"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Pencil, MessageSquare, Phone, FileWarning, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getCustomers,
  saveCustomers,
  STATUS_LABEL,
  type Customer,
  type CustomerStatus,
} from "@/lib/customers-data";
import { EditCustomerModal } from "@/components/AddCustomerModal";
import {
  getActivities,
  addActivity,
  deleteActivity,
  type CustomerActivity,
  type ActivityType,
} from "@/lib/customer-activities";
import { useAccidents } from "@/contexts/AccidentContext";
import { ACCIDENT_STATUS_LABEL } from "@/types/accident";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: CustomerStatus }) {
  const styles: Record<CustomerStatus, string> = {
    prospect: "bg-gray-100 text-gray-700 border-gray-200",
    proposal: "bg-blue-100 text-blue-800 border-blue-200",
    negotiation: "bg-amber-100 text-amber-800 border-amber-200",
    active: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

const INFO_ROWS: {
  key: "expiryDate" | "manager" | "phone" | "businessId" | "status";
  label: string;
}[] = [
  { key: "expiryDate", label: "만기일" },
  { key: "manager", label: "담당 소장" },
  { key: "phone", label: "연락처" },
  { key: "businessId", label: "사업자등록번호" },
  { key: "status", label: "상태" },
];

const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  memo: "메모",
  call: "통화",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const customer = customers.find((c) => c.id === id);

  useEffect(() => {
    setCustomers(getCustomers());
  }, [id]);

  const [editOpen, setEditOpen] = useState(false);
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [activityType, setActivityType] = useState<ActivityType>("memo");
  const [activityContent, setActivityContent] = useState("");

  useEffect(() => {
    if (id) setActivities(getActivities(id));
  }, [id]);

  const handleSaveCustomer = useCallback((updated: Customer) => {
    setCustomers((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      saveCustomers(next);
      return next;
    });
    setEditOpen(false);
  }, []);

  const handleAddActivity = useCallback(() => {
    if (!id || !activityContent.trim()) return;
    addActivity(id, { type: activityType, content: activityContent });
    setActivities(getActivities(id));
    setActivityContent("");
  }, [id, activityType, activityContent]);

  const handleDeleteActivity = useCallback((activityId: string) => {
    deleteActivity(activityId);
    if (id) setActivities(getActivities(id));
  }, [id]);

  const { accidents } = useAccidents();
  const customerAccidents = customer
    ? accidents.filter((a) => a.apartmentName === customer.name)
    : [];

  if (!customer) {
    return (
      <div className="p-4 md:p-6">
        <Link
          href="/planner/customers?tab=list"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          고객 목록으로
        </Link>
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">해당 아파트 정보를 찾을 수 없습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/planner/customers?tab=list")}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
      <Link
        href="/planner/customers?tab=list"
        className="mb-4 inline-flex w-fit items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        고객 목록으로
      </Link>
      <div className="flex flex-1 gap-6">
        {/* 왼쪽: 고객 상세 카드 */}
        <aside className="w-full shrink-0 md:w-[320px]">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-gray-900 truncate">
                      {customer.name}
                    </h1>
                    <p className="text-sm text-gray-500">아파트 관리</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </Button>
              </div>
            </div>
            <div className="px-5 py-4">
              <h2 className="mb-3 text-sm font-medium text-gray-700">
                상세 정보
              </h2>
              <dl className="space-y-3">
                {INFO_ROWS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-medium text-gray-500">{label}</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {key === "status" ? (
                        <StatusBadge status={customer.status} />
                      ) : (
                        (customer[key] as string) || "—"
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <EditCustomerModal
            open={editOpen}
            onOpenChange={setEditOpen}
            customer={customer}
            onSave={handleSaveCustomer}
          />
        </aside>

        {/* 오른쪽: 활동 및 사고 내역 */}
        <main className="min-w-0 flex-1 space-y-6">
          {/* 활동 (메모, 통화기록) */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                활동 (메모, 통화기록)
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2 items-center">
                <div className="flex flex-1 min-w-0 h-10 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <Input
                    placeholder="내용을 입력하세요"
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                    className="flex-1 min-w-0 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex gap-1 shrink-0 border-l border-gray-200 pl-2">
                    <Button
                      type="button"
                      variant={activityType === "memo" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setActivityType("memo")}
                    >
                      메모
                    </Button>
                    <Button
                      type="button"
                      variant={activityType === "call" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setActivityType("call")}
                    >
                      통화
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddActivity}
                  disabled={!activityContent.trim()}
                  className="shrink-0 h-10"
                >
                  추가
                </Button>
              </div>
              <ul className="space-y-2 max-h-[240px] overflow-y-auto">
                {activities.length === 0 ? (
                  <li className="py-6 text-center text-sm text-gray-500">
                    등록된 활동이 없습니다.
                  </li>
                ) : (
                  activities.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50/80 px-3 py-2 text-sm"
                    >
                      <span className="shrink-0 mt-0.5">
                        {a.type === "call" ? (
                          <Phone className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-700">
                          {ACTIVITY_TYPE_LABEL[a.type]}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(a.date).toLocaleString("ko-KR")}
                        </span>
                        <p className="mt-0.5 text-gray-800 break-words">
                          {a.content}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteActivity(a.id)}
                        aria-label="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* 아파트 사고 내역 */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <FileWarning className="h-4 w-4 text-gray-500" />
                아파트 사고 내역
              </h2>
            </div>
            <div className="p-5">
              {customerAccidents.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  해당 단지 사고 접수 내역이 없습니다.
                </p>
              ) : (
                <ul className="space-y-3">
                  {customerAccidents.map((acc) => (
                    <li
                      key={acc.id}
                      className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-gray-500">
                          {new Date(acc.date).toLocaleString("ko-KR")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ACCIDENT_STATUS_LABEL[acc.status]}
                        </Badge>
                      </div>
                      <p className="text-gray-800">
                        {acc.content.length > 15
                          ? `${acc.content.slice(0, 15)}…`
                          : acc.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
