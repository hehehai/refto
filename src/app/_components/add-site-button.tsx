"use client";

import { useAtom } from "jotai";
import { BoxAddIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { refSiteDialogAtom } from "../[locale]/(panel)/_store/dialog.store";

export function AddSiteButton() {
  const [status, setStatus] = useAtom(refSiteDialogAtom);

  return (
    <Button
      className="rounded-full"
      disabled={status.show}
      onClick={() => setStatus({ show: true, isAdd: true, id: null })}
      variant={"secondary"}
    >
      <BoxAddIcon className="mr-2 text-xl" />
      <span>Add Site</span>
    </Button>
  );
}
