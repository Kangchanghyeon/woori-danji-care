"use client";

import { useMemo, useEffect, useState } from "react";
import { HunterMap } from "@/components/HunterMap";
import { getCustomers } from "@/lib/customers-data";
import { DUMMY_APARTMENTS } from "@/data/dummyApartments";
import type { DummyApartment } from "@/data/dummyApartments";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceMeters, RADIUS_KM } from "@/lib/geo-utils";

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const { lat: userLat, lng: userLng } = useGeolocation();
  const userCenter =
    userLat != null && userLng != null ? { lat: userLat, lng: userLng } : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  /** 현재 계약 중(active)인 아파트만 지도에 표시. 만기일은 고객 관리 데이터(expiryDate) 사용. 만기일이 오늘부터 60일 이내면 노란색(D-60 이내), 그 외 초록색. 내 위치 있을 때 반경 3km 이내만 표시 */
  const contractApartments = useMemo((): DummyApartment[] => {
    if (!mounted) return [];
    const customers = getCustomers();
    const activeCustomers = customers.filter((c) => c.status === "active");
    const expiryByName = new Map(
      activeCustomers.map((c) => [c.name, c.expiryDate])
    );
    const activeNames = new Set(activeCustomers.map((c) => c.name));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixtyDaysLater = new Date(today);
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
    let list = DUMMY_APARTMENTS.filter((a) => activeNames.has(a.name)).map(
      (apt) => {
        const renewalDate = expiryByName.get(apt.name) ?? apt.renewalDate;
        const [m, d] = renewalDate.split("-").map(Number);
        const expiryDate = new Date(today.getFullYear(), m - 1, d);
        expiryDate.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
          expiryDate.setFullYear(today.getFullYear() + 1);
        }
        const within60Days = expiryDate.getTime() <= sixtyDaysLater.getTime();
        return within60Days
          ? { ...apt, renewalDate, pinType: "yellow" as const, label: "계약 중 (D-60 이내)" }
          : { ...apt, renewalDate, pinType: "green" as const, label: "계약 중" };
      }
    );
    if (userLat != null && userLng != null) {
      const radiusM = RADIUS_KM * 1000;
      list = list.filter(
        (apt) =>
          distanceMeters(userLat, userLng, apt.lat, apt.lng) <= radiusM
      );
    }
    return list;
  }, [mounted, userLat, userLng]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="page-title">관리 단지 지도</h1>
      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: "#22C55E" }}
          />
          계약 중
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          계약 중 (D-60 이내)
        </span>
      </div>
      <div className="relative h-[500px] w-full overflow-hidden rounded-lg border border-gray-200">
        {mounted && (
          <HunterMap
            className="h-full w-full"
            apartments={contractApartments}
            center={userCenter ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
