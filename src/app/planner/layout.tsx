import { PlannerSidebar } from "./PlannerSidebar";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <PlannerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
