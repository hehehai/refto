import { DataTable } from './_components/data-table'

export default function SubmitSitesPage() {
  return (
    <div className="w-full pb-8 pt-12">
      <div className="container mx-auto">
        <h2 className="text-3xl">Submit Sites</h2>
        <section className="mt-9">
          <DataTable />
        </section>
      </div>
    </div>
  )
}
