"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle, FileText, Phone, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAccidents } from "@/contexts/AccidentContext";
import { ACCIDENT_STATUS_LABEL } from "@/types/accident";
import type { AccidentStatus } from "@/types/accident";

const INSURANCE_PRODUCTS = [
  { value: "apartment-fire", label: "아파트화재보험" },
  { value: "playground-liability", label: "어린이놀이시설배상책임보험" },
  { value: "elevator-liability", label: "승강기사고배상책임보험" },
  { value: "other", label: "기타보험" },
] as const;

export default function ClientDashboardPage() {
  const { accidents, addAccident } = useAccidents();
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [accidentYear, setAccidentYear] = useState(String(now.getFullYear()));
  const [accidentMonth, setAccidentMonth] = useState(String(now.getMonth() + 1));
  const [accidentDay, setAccidentDay] = useState(String(now.getDate()));
  const [accidentHour, setAccidentHour] = useState(String(now.getHours()));
  const [accidentMinute, setAccidentMinute] = useState(String(now.getMinutes()));
  const [content, setContent] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const [estimateOpen, setEstimateOpen] = useState(false);
  const [productType, setProductType] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryDay, setExpiryDay] = useState("");
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(
      Number(accidentYear),
      Number(accidentMonth) - 1,
      Number(accidentDay),
      Number(accidentHour),
      Number(accidentMinute)
    ).toISOString();
    const photoUrls: string[] = [];
    if (photoFiles.length > 0) {
      const results = await Promise.all(
        photoFiles.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(file);
            })
        )
      );
      photoUrls.push(...results);
    }
    addAccident({
      apartmentName: "우리 단지",
      date,
      content: content.trim() || "(내용 없음)",
      photos: photoUrls,
    });
    toast.success("사고 접수가 완료되었습니다.");
    setOpen(false);
    setAccidentYear(String(now.getFullYear()));
    setAccidentMonth(String(now.getMonth() + 1));
    setAccidentDay(String(now.getDate()));
    setAccidentHour(String(now.getHours()));
    setAccidentMinute(String(now.getMinutes()));
    setContent("");
    setPhotoFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const handleEstimateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productLabel =
      INSURANCE_PRODUCTS.find((p) => p.value === productType)?.label ?? (productType || "보험");
    const content = `보험 견적 접수 - ${productLabel} (만기 ${expiryMonth}/${expiryDay})`;
    addAccident({
      apartmentName: "우리 단지",
      date: new Date().toISOString(),
      content,
      photos: [],
    });
    toast.success(
      `보험 견적 접수가 완료되었습니다. (${productLabel}) 담당자가 연락드리겠습니다.`
    );
    setEstimateOpen(false);
    setProductType("");
    setExpiryMonth("");
    setExpiryDay("");
    setCertificateFiles([]);
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setCertificateFiles((prev) => [...prev, ...files]);
  };

  const statusVariant = (status: AccidentStatus) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "Completed":
        return "default";
      case "Processing":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* 로고: 방패 아이콘 + 우리단지케어 + 태그라인 */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <Shield
              className="h-8 w-8 shrink-0"
              style={{ color: "#1E3A8A" }}
              aria-hidden
            />
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#1E3A8A" }}>
              우리단지케어
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-600">
            아파트 화재보험 전문 관리 솔루션
          </p>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-slate-800">
          관리사무소 대시보드
        </h2>
        <p className="mb-10 text-center text-slate-600">
          아래 버튼으로 접수·요청해 주세요.
        </p>

        <div className="mb-14 flex flex-wrap justify-center gap-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-14 min-w-[180px] gap-2 rounded-xl bg-emerald-500 px-6 text-base font-semibold text-white shadow-md hover:bg-emerald-600"
              >
                <PlusCircle className="h-5 w-5" />
                신규 사고 접수
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>신규 사고 접수</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>사고 일시</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={accidentYear}
                        onChange={(e) => setAccidentYear(e.target.value)}
                        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                      >
                        {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map(
                          (y) => (
                            <option key={y} value={y}>
                              {y}년
                            </option>
                          )
                        )}
                      </select>
                      <select
                        value={accidentMonth}
                        onChange={(e) => setAccidentMonth(e.target.value)}
                        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <option
                              key={m}
                              value={m}
                              disabled={
                                Number(accidentYear) === now.getFullYear() &&
                                m > now.getMonth() + 1
                              }
                            >
                              {m}
                            </option>
                          )
                        )}
                      </select>
                      <select
                        value={accidentDay}
                        onChange={(e) => setAccidentDay(e.target.value)}
                        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                      >
                        {Array.from(
                          {
                            length: new Date(
                              Number(accidentYear),
                              Number(accidentMonth),
                              0
                            ).getDate(),
                          },
                          (_, i) => i + 1
                        ).map((d) => (
                          <option
                            key={d}
                            value={d}
                            disabled={
                              Number(accidentYear) === now.getFullYear() &&
                              Number(accidentMonth) === now.getMonth() + 1 &&
                              d > now.getDate()
                            }
                          >
                            {d}일
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={accidentHour}
                        onChange={(e) => setAccidentHour(e.target.value)}
                        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                          <option
                            key={h}
                            value={h}
                            disabled={
                              Number(accidentYear) === now.getFullYear() &&
                              Number(accidentMonth) === now.getMonth() + 1 &&
                              Number(accidentDay) === now.getDate() &&
                              h > now.getHours()
                            }
                          >
                            {String(h).padStart(2, "0")}시
                          </option>
                        ))}
                      </select>
                      <select
                        value={accidentMinute}
                        onChange={(e) => setAccidentMinute(e.target.value)}
                        className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                      >
                        {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                          <option
                            key={m}
                            value={m}
                            disabled={
                              Number(accidentYear) === now.getFullYear() &&
                              Number(accidentMonth) === now.getMonth() + 1 &&
                              Number(accidentDay) === now.getDate() &&
                              Number(accidentHour) === now.getHours() &&
                              m > now.getMinutes()
                            }
                          >
                            {String(m).padStart(2, "0")}분
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">사고 내용</Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="발생 장소, 원인, 피해 상황 등을 간단히 적어 주세요."
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>현장 사진 (선택)</Label>
                  <div className="border-input flex min-h-[80px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {photoFiles.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {photoFiles.length}개 파일 선택됨
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">제출하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={estimateOpen} onOpenChange={setEstimateOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                className="h-14 min-w-[180px] gap-2 rounded-xl border-2 border-sky-200 bg-white px-6 text-base font-semibold text-sky-700 shadow-sm hover:bg-sky-50 hover:border-sky-300"
              >
                <FileText className="h-5 w-5" />
                보험 견적 접수
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>보험 견적 접수</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEstimateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">어떤 상품을 요청할까요?</Label>
                  <select
                    id="product"
                    required
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                  >
                    <option value="">선택하세요</option>
                    {INSURANCE_PRODUCTS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>만기 날짜 (월/일)</Label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      className="border-input bg-background focus-visible:ring-ring flex h-9 flex-1 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                    >
                      <option value="">월</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1)}>
                          {i + 1}월
                        </option>
                      ))}
                    </select>
                    <select
                      required
                      value={expiryDay}
                      onChange={(e) => setExpiryDay(e.target.value)}
                      className="border-input bg-background focus-visible:ring-ring flex h-9 flex-1 rounded-md border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                    >
                      <option value="">일</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i} value={String(i + 1)}>
                          {i + 1}일
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>현재 가입되어 있는 상품 증권 사진 (선택)</Label>
                  <div className="border-input flex min-h-[80px] flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCertificateChange}
                      className="cursor-pointer"
                    />
                    {certificateFiles.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {certificateFiles.length}개 파일 선택됨
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEstimateOpen(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit">제출하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            size="lg"
            variant="outline"
            className="h-14 min-w-[180px] gap-2 rounded-xl border-2 border-amber-200 bg-white px-6 text-base font-semibold text-amber-700 shadow-sm hover:bg-amber-50 hover:border-amber-300"
            onClick={() => {
              addAccident({
                apartmentName: "우리 단지",
                date: new Date().toISOString(),
                content: "담당자 연락 요청",
                photos: [],
              });
              toast.success(
                "담당자 연락 요청이 접수되었습니다. 빠르게 연락드리겠습니다."
              );
            }}
          >
            <Phone className="h-5 w-5" />
            담당자 연락 요청
          </Button>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            요청 내역
          </h2>
          {accidents.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              아직 요청 내역이 없습니다.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>요청일</TableHead>
                  <TableHead>요청 내용</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accidents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(a.date).toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {a.content.length > 15
                        ? `${a.content.slice(0, 15)}…`
                        : a.content}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(a.status) as "secondary" | "default" | "outline"}>
                        {ACCIDENT_STATUS_LABEL[a.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
