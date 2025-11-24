import { AdminHeader } from "@/components/features/admin/admin-header";
import { DataTable } from "./_components/data-table";

export default function RefSitesPage() {
  return (
    <>
      <AdminHeader title="Ref Sites" />
      <div className="flex flex-1 flex-col">
        <DataTable />
      </div>
    </>
  );
}
