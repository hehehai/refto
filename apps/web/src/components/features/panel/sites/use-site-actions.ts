import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/orpc";

export function useSiteActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [["panel", "site", "list"]] });
  };

  const create = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.create>[0]) =>
      client.panel.site.create(input),
    onSuccess: () => {
      toast.success("Site created successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create site");
    },
  });

  const update = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.update>[0]) =>
      client.panel.site.update(input),
    onSuccess: () => {
      toast.success("Site updated successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update site");
    },
  });

  const remove = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.delete>[0]) =>
      client.panel.site.delete(input),
    onSuccess: () => {
      toast.success("Site deleted successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete site");
    },
  });

  const batchDelete = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.batchDelete>[0]) =>
      client.panel.site.batchDelete(input),
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} site(s) deleted successfully`);
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete sites");
    },
  });

  const pin = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.pin>[0]) =>
      client.panel.site.pin(input),
    onSuccess: () => {
      toast.success("Site pinned successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to pin site");
    },
  });

  const unpin = useMutation({
    mutationFn: (input: Parameters<typeof client.panel.site.unpin>[0]) =>
      client.panel.site.unpin(input),
    onSuccess: () => {
      toast.success("Site unpinned successfully");
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unpin site");
    },
  });

  return {
    create,
    update,
    remove,
    batchDelete,
    pin,
    unpin,
  };
}
