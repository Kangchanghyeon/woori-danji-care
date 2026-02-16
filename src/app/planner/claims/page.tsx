"use client";

import { useState, useMemo, useRef } from "react";
import { Search, Printer, Send } from "lucide-react";
import { useAccidents } from "@/contexts/AccidentContext";
import { ACCIDENT_STATUS_LABEL } from "@/types/accident";
import type { Accident, AccidentStatus } from "@/types/accident";
import { getCustomers } from "@/lib/customers-data";
import { DUMMY_APARTMENTS } from "@/data/dummyApartments";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 신규 사고 접수만 해당 (보험 견적 접수, 담당자 연락 요청 제외) */
const isAccidentRequest = (content: string) =>
  !content.startsWith("보험 견적 접수") && !content.startsWith("담당자 연락 요청");

export default function ClaimsPage() {
  const { accidents, updateStatus } = useAccidents();
  const [searchApartment, setSearchApartment] = useState("");
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  const reportPrintRef = useRef<HTMLDivElement>(null);

  /** 사고 접수만 필터 */
  const accidentRequests = useMemo(
    () => accidents.filter((a) => isAccidentRequest(a.content)),
    [accidents]
  );

  /** 아파트명 검색 적용 */
  const filteredAccidents = useMemo(() => {
    if (!searchApartment.trim()) return accidentRequests;
    const q = searchApartment.trim().toLowerCase();
    return accidentRequests.filter((a) =>
      a.apartmentName.toLowerCase().includes(q)
    );
  }, [accidentRequests, searchApartment]);

  /** 고객 카드에 등록된 사업자번호 우선, 없으면 DUMMY_APARTMENTS */
  const businessIdFor = (apartmentName: string) => {
    const customer = getCustomers().find((c) => c.name === apartmentName);
    if (customer?.businessId?.trim()) return customer.businessId.trim();
    return DUMMY_APARTMENTS.find((a) => a.name === apartmentName)?.businessId ?? "-";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="page-title">사고 접수</h1>

      {/* 아파트명 검색 */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="🔍 아파트명으로 검색"
          value={searchApartment}
          onChange={(e) => setSearchApartment(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 사고 접수 목록 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">접수일</TableHead>
              <TableHead className="px-4 py-3">아파트명</TableHead>
              <TableHead className="px-4 py-3">사고 내용</TableHead>
              <TableHead className="px-4 py-3">상태</TableHead>
              <TableHead className="w-[120px] px-4 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccidents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {accidentRequests.length === 0
                    ? "접수된 사고가 없습니다."
                    : "검색 결과가 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAccidents.map((accident) => (
                <TableRow
                  key={accident.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedAccident(accident)}
                >
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {new Date(accident.date).toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    {accident.apartmentName}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate px-4 py-3 text-gray-600">
                    {accident.content}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge status={accident.status} />
                  </TableCell>
                  <TableCell
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {accident.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                        onClick={() => updateStatus(accident.id, "Completed")}
                      >
                        접수 확인
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
                <Button variant="outline" className="gap-2">
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
