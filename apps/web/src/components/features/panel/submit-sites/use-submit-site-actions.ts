import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/orpc";

export function useSubmitSiteActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [["panel", "submitSite", "list"]],
    });
  };

  const approve = useMutation({
    mutationFn: (
      input: Parameters<typeof client.panel.submitSite.approve>[0]
    ) => client.panel.submitSite.approve(input),
    onSuccess: () => {
      toast.success("Submission approved successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve submission");
    },
  });

  const reject = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.submitSite.reject>[0]) =>
      client.panel.submitSite.reject(input),
    onSuccess: () => {
      toast.success("Submission rejected successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject submission");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.submitSite.delete>[0]) =>
      client.panel.submitSite.delete(input),
    onSuccess: () => {
      toast.success("Submission deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete submission");
    },
  });

  return {
    approve,
    reject,
    remove,
  };
}
