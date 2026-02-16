"use client";

export type AccidentReportTemplateProps = {
  apartmentName: string;
  businessId?: string;
  accidentDate: string;
  location?: string;
  description: string;
  /** 현장 사진 URL 목록 (인쇄용) */
  photoUrls?: string[];
};

/** 사고일시 포맷: 년월일 / 오전·오후 시분경 */
function formatAccidentDateTime(isoDate: string) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const isAm = hour < 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    dateStr: `${year}년 ${month}월 ${day}일`,
    timeStr: `${isAm ? "오전" : "오후"} ${displayHour}시 ${minute}분경`,
  };
}

export function AccidentReportTemplate({
  apartmentName,
  businessId = "-",
  accidentDate,
  location = "-",
  description,
  photoUrls = [],
}: AccidentReportTemplateProps) {
  const dateTimeFormatted = accidentDate && formatAccidentDateTime(accidentDate);

  return (
    <div
      className="mx-auto w-full max-w-[210mm] rounded border border-gray-300 bg-white p-8 shadow-sm print:max-w-none print:shadow-none"
      style={{ maxWidth: "210mm" }}
    >
      {/* 제목 */}
      <h1 className="mb-8 text-center text-xl font-bold text-gray-900">
        사고 접수 확인서
      </h1>

      {/* 단지 정보 */}
      <table className="mb-4 w-full border-collapse border border-gray-400 text-sm">
        <tbody>
          <tr>
            <th className="w-28 border border-gray-400 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
              단지 정보
            </th>
            <td className="border border-gray-400 px-3 py-2 text-gray-700">
              <table className="w-full border-collapse text-sm">
                <tr>
                  <th className="w-24 border-b border-gray-200 py-1.5 text-left font-medium text-gray-600">
                    아파트명
                  </th>
                  <td className="border-b border-gray-200 py-1.5">
                    {apartmentName}
                  </td>
                </tr>
                <tr>
                  <th className="w-24 py-1.5 text-left font-medium text-gray-600">
                    사업자등록번호
                  </th>
                  <td className="py-1.5">{businessId}</td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 사고 정보 */}
      <table className="mb-4 w-full border-collapse border border-gray-400 text-sm">
        <tbody>
          <tr>
            <th className="w-28 border border-gray-400 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-800">
              사고 정보
            </th>
            <td className="border border-gray-400 px-3 py-2 text-gray-700">
              <table className="w-full border-collapse text-sm">
                <tr>
                  <th className="w-24 border-b border-gray-200 py-1.5 text-left font-medium text-gray-600">
                    사고 일시
                  </th>
                  <td className="border-b border-gray-200 py-1.5">
                    {dateTimeFormatted ? (
                      <div className="space-y-0.5">
                        <div>{dateTimeFormatted.dateStr}</div>
                        <div>{dateTimeFormatted.timeStr}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="w-24 py-1.5 text-left font-medium text-gray-600">
                    사고 장소
                  </th>
                  <td className="py-1.5">{location}</td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 사고 내용 */}
      <table className="mb-4 w-full border-collapse border border-gray-400 text-sm">
        <tbody>
          <tr>
            <th className="w-28 border border-gray-400 bg-gray-100 px-3 py-2 align-top text-left font-semibold text-gray-800">
              사고 내용
            </th>
            <td className="min-h-[80px] border border-gray-400 px-3 py-2 text-gray-700 whitespace-pre-wrap break-words">
              {description || "(내용 없음)"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 현장 사진 */}
      <table className="w-full border-collapse border border-gray-400 text-sm">
        <tbody>
          <tr>
            <th className="w-28 border border-gray-400 bg-gray-100 px-3 py-2 align-top text-left font-semibold text-gray-800">
              현장 사진
            </th>
            <td className="border border-gray-400 px-3 py-2">
              {photoUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {photoUrls.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded border border-gray-200 bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`현장 사진 ${i + 1}`}
                        className="h-full w-full object-contain print:max-h-[140px]"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">첨부된 사진 없음</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
