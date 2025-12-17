import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

export function useSiteActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: orpc.panel.site.list.key() });
  };

  const create = useMutation({
    ...orpc.panel.site.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Site created successfully");
      invalidate();
    },
  });

  const update = useMutation({
    ...orpc.panel.site.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Site updated successfully");
      invalidate();
    },
  });

  const remove = useMutation({
    ...orpc.panel.site.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Site deleted successfully");
      invalidate();
    },
  });

  const batchDelete = useMutation({
    ...orpc.panel.site.batchDelete.mutationOptions(),
    onSuccess: (result) => {
      toast.success(`${result.deletedCount} site(s) deleted successfully`);
      invalidate();
    },
  });

  const pin = useMutation({
    ...orpc.panel.site.pin.mutationOptions(),
    onSuccess: () => {
      toast.success("Site pinned successfully");
      invalidate();
    },
  });

  const unpin = useMutation({
    ...orpc.panel.site.unpin.mutationOptions(),
    onSuccess: () => {
      toast.success("Site unpinned successfully");
      invalidate();
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
