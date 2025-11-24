import { AdminHeader } from "@/components/features/admin/admin-header";
import { DataTable } from "./_components/data-table";

export default function SubscriberPage() {
  return (
    <>
      <AdminHeader title="Subscriber" />
      <div className="flex flex-1 flex-col">
        <DataTable />
      </div>
    </>
  );
}
