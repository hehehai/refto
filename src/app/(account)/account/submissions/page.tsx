"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchIcon, SendIcon, Spinner } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/lib/orpc/react";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

const statusVariants: Record<
  SubmissionStatus,
  "default" | "secondary" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

const statusLabels: Record<SubmissionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export default function SubmissionsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { data, isLoading, isError } = useQuery(
    orpc.submitSite.mySubmissions.queryOptions({
      input: {
        search: search || undefined,
        limit: itemsPerPage,
        page: currentPage,
      },
    })
  );

  const submissions = data?.rows ?? [];
  const totalPages = data?.maxPage ?? 1;
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Failed to load submissions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">My Submissions</h1>
        <p className="text-muted-foreground text-sm">
          Sites you have submitted for review ({total})
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(0);
          }}
          placeholder="Search submissions..."
          value={search}
        />
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SendIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              Track the status of your submitted sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Submitted
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {submission.siteTitle}
                        </div>
                        <div className="line-clamp-1 text-muted-foreground text-xs md:hidden">
                          {submission.siteUrl}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                      <a
                        className="text-muted-foreground hover:text-foreground hover:underline"
                        href={submission.siteUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {submission.siteUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[submission.status]}>
                        {statusLabels[submission.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => p - 1)}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((p) => p + 1)}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
