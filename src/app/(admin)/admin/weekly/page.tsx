import { AdminHeader } from "@/components/features/admin/admin-header";
import { DataTable } from "./_components/data-table";

export default function WeeklyPage() {
  return (
    <>
      <AdminHeader title="Weekly" />
      <div className="flex flex-1 flex-col">
        <DataTable />
      </div>
    </>
  );
}
