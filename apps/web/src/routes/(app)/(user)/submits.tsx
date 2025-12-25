import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { SubmitDataTable } from "@/components/features/submits/data-table";
import { EditSubmitDialog } from "@/components/features/submits/edit-dialog";
import type {
  SubmitSiteRow,
  SubmitStatus,
} from "@/components/features/submits/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/lib/orpc";
import { authQueryOptions } from "@/lib/queries";
import { createPageMeta } from "@/lib/seo";

const submitsMeta = createPageMeta({
  title: "My Submissions",
  description: "Track your submitted websites on Refto.",
  url: "/submits",
  noIndex: true,
});

export const Route = createFileRoute("/(app)/(user)/submits")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(authQueryOptions());
    if (!user) {
      throw redirect({ to: "/signin" });
    }
  },
  component: SubmitsComponent,
  head: () => ({
    meta: submitsMeta.meta,
    links: submitsMeta.links,
  }),
});

function SubmitsComponent() {
  const [activeTab, setActiveTab] = useState<SubmitStatus>("ALL");
  const [editSubmission, setEditSubmission] = useState<SubmitSiteRow | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: submissions = [], isLoading } = useQuery(
    orpc.features.submitSite.list.queryOptions()
  );

  // Filter submissions by status
  const filteredSubmissions = useMemo(() => {
    if (activeTab === "ALL") {
      return submissions;
    }
    return submissions.filter((s) => s.status === activeTab);
  }, [submissions, activeTab]);

  // Count by status
  const counts = useMemo(
    () => ({
      ALL: submissions.length,
      PENDING: submissions.filter((s) => s.status === "PENDING").length,
      APPROVED: submissions.filter((s) => s.status === "APPROVED").length,
      REJECTED: submissions.filter((s) => s.status === "REJECTED").length,
    }),
    [submissions]
  );

  const handleEdit = useCallback((submission: SubmitSiteRow) => {
    setEditSubmission(submission);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogChange = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditSubmission(null);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">My Submissions</h1>

      <Tabs
        onValueChange={(value) => setActiveTab(value as SubmitStatus)}
        value={activeTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({counts.PENDING})</TabsTrigger>
          <TabsTrigger value="APPROVED">
            Approved ({counts.APPROVED})
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Rejected ({counts.REJECTED})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ALL">
          <SubmitDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="ALL"
          />
        </TabsContent>

        <TabsContent value="PENDING">
          <SubmitDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="PENDING"
          />
        </TabsContent>

        <TabsContent value="APPROVED">
          <SubmitDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="APPROVED"
          />
        </TabsContent>

        <TabsContent value="REJECTED">
          <SubmitDataTable
            data={filteredSubmissions}
            isLoading={isLoading}
            onEdit={handleEdit}
            status="REJECTED"
          />
        </TabsContent>
      </Tabs>

      <EditSubmitDialog
        onOpenChange={handleEditDialogChange}
        open={editDialogOpen}
        submission={editSubmission}
      />
    </div>
  );
}
