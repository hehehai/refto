"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Spinner } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

const providerLabels: Record<string, string> = {
  credential: "Email & Password",
  google: "Google",
  github: "GitHub",
  twitter: "Twitter",
  discord: "Discord",
  apple: "Apple",
};

export function AccountsCard() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await authClient.listAccounts();
      return data || [];
    },
    enabled: isOpen,
  });

  return (
    <Collapsible
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between p-6">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">
              Connected Accounts
            </h3>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Manage your linked accounts and login methods
            </p>
          </div>
          <ChevronDownIcon
            className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-6 pt-4 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Badge variant="secondary">
                        {providerLabels[account.providerId] ||
                          account.providerId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {account.createdAt
                        ? format(new Date(account.createdAt), "PPP")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-center text-muted-foreground text-sm">
              No connected accounts found
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
