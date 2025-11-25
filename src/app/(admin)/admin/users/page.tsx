import { AdminHeader } from "@/components/features/admin/admin-header";
import { DataTable } from "./_components/data-table";
import { UserEditDialog } from "./_components/user-edit-dialog";

export default function UsersPage() {
  return (
    <>
      <AdminHeader title="Users" />
      <div className="flex flex-1 flex-col">
        <DataTable />
      </div>
      <UserEditDialog />
    </>
  );
}
