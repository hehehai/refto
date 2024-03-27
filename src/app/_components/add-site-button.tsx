"use client";

import { refSiteDialogAtom } from "../[locale]/(panel)/_store/dialog.store";
import { BoxAddIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";

export function AddSiteButton() {
  const [status, setStatus] = useAtom(refSiteDialogAtom);

  return (
    <Button
      variant={"secondary"}
      className="rounded-full"
      disabled={status.show}
      onClick={() => setStatus({ show: true, isAdd: true, id: null })}
    >
      <BoxAddIcon className="mr-2 text-xl"></BoxAddIcon>
      <span>Add Site</span>
    </Button>
  );
}
