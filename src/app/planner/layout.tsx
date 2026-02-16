import { PlannerSidebar } from "./PlannerSidebar";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] md:flex-row">
      <PlannerSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
