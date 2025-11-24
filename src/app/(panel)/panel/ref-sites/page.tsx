import { DataTable } from "./_components/data-table";

export default function RefSitesPage() {
  return (
    <div className="w-full pt-12 pb-8">
      <div className="container mx-auto">
        <h2 className="text-3xl">Ref Sites</h2>
        <section className="mt-9">
          <DataTable />
        </section>
      </div>
    </div>
  );
}
