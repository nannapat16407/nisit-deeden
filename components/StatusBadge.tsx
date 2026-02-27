import { RequestStatus } from "@/types/request.type";

export const getStatusBadge = (status: RequestStatus) => {
  switch (status) {
    case "PENDING_HEAD":
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รอหัวหน้าภาคฯ
        </span>
      );
    case "PENDING_VICEDEAN":
      return (
        <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รอรองคณบดี
        </span>
      );
    case "PENDING_DEAN":
      return (
        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รอคณบดี
        </span>
      );
    case "PENDING_SD":
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รอกองพัฒฯ
        </span>
      );
    case "PENDING_COMMITTEE":
      return (
        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รอคณะกรรมการ
        </span>
      );
    case "PENDING_PRESIDENT":
      return (
        <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          รออธิการบดี
        </span>
      );
    case "REJECTED_BY_HEAD":
    case "REJECTED_BY_VICEDEAN":
    case "REJECTED_BY_DEAN":
    case "REJECTED_BY_COMMITTEE":
      return (
        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          ปฎิเสธ
        </span>
      );
    case "NEEDS_DOCS":
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          ขอเอกสารเพิ่ม
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {status}
        </span>
      );
  }
};
