import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/orpc";

export function useSubmitActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [["features", "submitSite", "list"]],
    });
  };

  const update = useMutation({
    mutationFn: (
      input: Parameters<typeof client.features.submitSite.update>[0]
    ) => client.features.submitSite.update(input),
    onSuccess: () => {
      toast.success("Submission updated successfully");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (
      input: Parameters<typeof client.features.submitSite.delete>[0]
    ) => client.features.submitSite.delete(input),
    onSuccess: () => {
      toast.success("Submission deleted successfully");
      invalidate();
    },
  });

  return { update, remove };
}
