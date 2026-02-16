"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GripVertical, Plus, Search } from "lucide-react";
import { AddCustomerModal, type AddCustomerData } from "@/components/AddCustomerModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getCustomers,
  saveCustomers,
  STATUS_LABEL,
  STATUS_ORDER,
  type Customer,
  type CustomerStatus,
} from "@/lib/customers-data";
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

function CustomersPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "pipeline" ? "pipeline" : "list";
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);
  const [dropTargetStatus, setDropTargetStatus] = useState<CustomerStatus | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [pipelineSearch, setPipelineSearch] = useState("");
  const pipelineMatchRef = useRef<HTMLDivElement | null>(null);

  const handleAddCustomer = useCallback((data: AddCustomerData) => {
    const id = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setCustomers((prev) => [{ id, ...data }, ...prev]);
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.manager.toLowerCase().includes(q)
    );
  }, [search, customers]);

  const byStatus = useMemo(() => {
    const map: Record<CustomerStatus, Customer[]> = {
      prospect: [],
      proposal: [],
      negotiation: [],
      active: [],
    };
    customers.forEach((c) => map[c.status].push(c));
    return map;
  }, [customers]);

  const handleDragStart = useCallback((e: React.DragEvent, customerId: string) => {
    e.dataTransfer.setData("customerId", customerId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(customerId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropTargetStatus(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: CustomerStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetStatus(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTargetStatus(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: CustomerStatus) => {
    e.preventDefault();
    setDropTargetStatus(null);
    const customerId = e.dataTransfer.getData("customerId");
    if (!customerId) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, status: newStatus } : c))
    );
    setDraggingId(null);
  }, []);

  /** 파이프라인 검색어와 일치하는 고객 id 집합 (아파트명 기준) */
  const pipelineMatchIds = useMemo(() => {
    const q = pipelineSearch.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(
      customers.filter((c) => c.name.toLowerCase().includes(q)).map((c) => c.id)
    );
  }, [customers, pipelineSearch]);

  /** 첫 번째 일치 고객 id (스크롤 포커스용) */
  const firstPipelineMatchId = useMemo(() => {
    const q = pipelineSearch.trim().toLowerCase();
    if (!q) return null;
    const found = customers.find((c) => c.name.toLowerCase().includes(q));
    return found?.id ?? null;
  }, [customers, pipelineSearch]);

  useEffect(() => {
    if (
      pipelineSearch.trim() &&
      firstPipelineMatchId &&
      pipelineMatchRef.current
    ) {
      pipelineMatchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [pipelineSearch, firstPipelineMatchId]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="page-title">고객 관리</h1>

      <AddCustomerModal
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onSave={handleAddCustomer}
      />

      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">전체 리스트 (List)</TabsTrigger>
          <TabsTrigger value="pipeline">영업 현황 (Pipeline)</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              카드를 드래그하여 단계를 옮기세요.
            </p>
            <div className="relative min-w-0 flex-1 max-w-xs sm:max-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-gray-400" />
              <Input
                placeholder="아파트명으로 검색"
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {STATUS_ORDER.map((status) => (
              <div
                key={status}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={cn(
                  "flex min-w-[280px] max-w-[280px] flex-col gap-3 rounded-lg border-2 border-dashed p-4 transition-colors",
                  (status === "prospect" || status === "proposal") && "bg-gray-100",
                  status === "negotiation" && "bg-amber-50/50",
                  status === "active" && "bg-green-50",
                  dropTargetStatus === status && "border-amber-400 bg-amber-50"
                )}
              >
                <h3 className="text-sm font-semibold text-gray-700">
                  {STATUS_LABEL[status]}
                </h3>
                <div className="flex flex-col gap-3">
                  {byStatus[status].map((customer) => {
                    const isMatch =
                      pipelineSearch.trim() &&
                      pipelineMatchIds.has(customer.id);
                    const isFirstMatch =
                      customer.id === firstPipelineMatchId;
                    return (
                      <div
                        key={customer.id}
                        ref={isFirstMatch ? pipelineMatchRef : undefined}
                      >
                        <Card
                          draggable
                          onDragStart={(e) => handleDragStart(e, customer.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "cursor-grab border-gray-200 shadow-sm active:cursor-grabbing",
                            draggingId === customer.id && "opacity-50",
                            isMatch &&
                              "ring-2 ring-primary border-primary/50 bg-primary/5"
                          )}
                        >
                          <CardHeader className="flex flex-row items-start gap-2 pb-2 pt-4">
                            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <CardTitle className="text-base">
                              {customer.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pb-4 pl-6 text-sm text-gray-600">
                            <p>만기 {customer.expiryDate}</p>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                  {byStatus[status].length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-400">
                      여기에 놓기
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 max-w-md">
              <Input
                placeholder="검색 (아파트명 또는 성함)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setAddCustomerOpen(true)} className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              신규 등록
            </Button>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">아파트명</TableHead>
                  <TableHead className="px-4 py-3">담당 소장</TableHead>
                  <TableHead className="px-4 py-3">연락처</TableHead>
                  <TableHead className="px-4 py-3">상태</TableHead>
                  <TableHead className="w-24 px-4 py-3">더보기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="px-4 py-3 font-medium">
                        {c.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {c.manager}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-600">
                        {c.phone}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Link
                          href={`/planner/customers/${c.id}`}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          더보기
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6"><h1 className="page-title">고객 관리</h1><p className="text-gray-500">로딩 중...</p></div>}>
      <CustomersPageContent />
    </Suspense>
  );
}
