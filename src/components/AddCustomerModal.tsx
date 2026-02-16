"use client";

import { useState, useEffect } from "react";
import type { Customer } from "@/lib/customers-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CustomerStatus =
  | "prospect"
  | "proposal"
  | "negotiation"
  | "active";

export type AddCustomerData = {
  name: string;
  manager: string;
  phone: string;
  status: CustomerStatus;
  expiryDate: string;
  businessId: string;
};

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: "prospect", label: "방문" },
  { value: "proposal", label: "견적 제안" },
  { value: "negotiation", label: "제출" },
  { value: "active", label: "계약 중" },
];

type AddCustomerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AddCustomerData) => void;
};

const initialForm: AddCustomerData = {
  name: "",
  manager: "",
  phone: "",
  status: "prospect",
  expiryDate: "",
  businessId: "",
};

export function AddCustomerModal({
  open,
  onOpenChange,
  onSave,
}: AddCustomerModalProps) {
  const [form, setForm] = useState<AddCustomerData>(initialForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      businessId: form.businessId?.trim() ?? "",
    });
    setForm(initialForm);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(initialForm);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>신규 아파트 직접 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">아파트명 *</Label>
            <Input
              id="name"
              placeholder="예: 반포자이"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">담당 소장</Label>
            <Input
              id="manager"
              placeholder="예: 김소장"
              value={form.manager}
              onChange={(e) => setForm((p) => ({ ...p, manager: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              placeholder="예: 010-1234-5678"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessId">사업자등록번호</Label>
            <Input
              id="businessId"
              placeholder="예: 120-81-12345"
              value={form.businessId}
              onChange={(e) =>
                setForm((p) => ({ ...p, businessId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              value={form.status}
              onValueChange={(value: CustomerStatus) =>
                setForm((p) => ({ ...p, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiryDate">보험 만기일 (MM-DD)</Label>
            <Input
              id="expiryDate"
              placeholder="예: 03-15"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, expiryDate: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type EditCustomerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: (updated: Customer) => void;
};

export function EditCustomerModal({
  open,
  onOpenChange,
  customer,
  onSave,
}: EditCustomerModalProps) {
  const [form, setForm] = useState<AddCustomerData>(initialForm);

  useEffect(() => {
    if (open && customer) {
      setForm({
        name: customer.name,
        manager: customer.manager,
        phone: customer.phone,
        status: customer.status,
        expiryDate: customer.expiryDate,
        businessId: customer.businessId ?? "",
      });
    }
  }, [open, customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !form.name.trim()) return;
    onSave({
      ...customer,
      name: form.name.trim(),
      manager: form.manager,
      phone: form.phone,
      status: form.status,
      expiryDate: form.expiryDate,
      businessId: form.businessId?.trim() ?? "",
    });
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(initialForm);
    onOpenChange(next);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>고객 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">아파트명 *</Label>
            <Input
              id="edit-name"
              placeholder="예: 반포자이"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-manager">담당 소장</Label>
            <Input
              id="edit-manager"
              placeholder="예: 김소장"
              value={form.manager}
              onChange={(e) => setForm((p) => ({ ...p, manager: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">연락처</Label>
            <Input
              id="edit-phone"
              placeholder="예: 010-1234-5678"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-businessId">사업자등록번호</Label>
            <Input
              id="edit-businessId"
              placeholder="예: 120-81-12345"
              value={form.businessId}
              onChange={(e) =>
                setForm((p) => ({ ...p, businessId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>상태</Label>
            <Select
              value={form.status}
              onValueChange={(value: CustomerStatus) =>
                setForm((p) => ({ ...p, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-expiryDate">보험 만기일 (MM-DD)</Label>
            <Input
              id="edit-expiryDate"
              placeholder="예: 03-15"
              value={form.expiryDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, expiryDate: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
