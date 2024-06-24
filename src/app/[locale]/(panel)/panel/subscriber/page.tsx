import { DataTable } from './_components/data-table'

export default function SubscriberPage() {
  return (
    <div className="w-full pb-8 pt-12">
      <div className="container mx-auto">
        <h2 className="text-3xl">Subscriber</h2>
        <section className="mt-9">
          <DataTable />
        </section>
      </div>
    </div>
  )
}
