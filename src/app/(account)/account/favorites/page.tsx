"use client";

import { useState } from "react";
import { LikeIcon, SearchIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data for UI demonstration
const mockFavorites = [
  {
    id: "1",
    siteName: "Stripe",
    siteUrl: "https://stripe.com",
    color: "bg-[#1a1a2e]",
    likedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    siteName: "Linear",
    siteUrl: "https://linear.app",
    color: "bg-[#5e60ce]",
    likedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    siteName: "Vercel",
    siteUrl: "https://vercel.com",
    color: "bg-black",
    likedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    siteName: "Figma",
    siteUrl: "https://figma.com",
    color: "bg-[#a259ff]",
    likedAt: new Date("2024-02-10"),
  },
];

export default function FavoritesPage() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState(mockFavorites);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredFavorites = favorites.filter((site) =>
    site.siteName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
  const paginatedFavorites = filteredFavorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUnlike = (id: string) => {
    setFavorites((prev) => prev.filter((site) => site.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">My Favorites</h1>
        <p className="text-muted-foreground text-sm">
          Sites you have liked ({filteredFavorites.length})
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search favorites..."
          value={search}
        />
      </div>

      {paginatedFavorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LikeIcon className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No favorites found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedFavorites.map((site) => (
            <Card className="overflow-hidden" key={site.id}>
              <div
                className={`flex aspect-4/3 items-center justify-center ${site.color}`}
              >
                <span className="font-medium text-2xl text-white">
                  {site.siteName}
                </span>
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{site.siteName}</CardTitle>
                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleUnlike(site.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <LikeIcon className="mr-1 h-4 w-4" />
                    Unlike
                  </Button>
                </div>
                <CardDescription className="truncate text-xs">
                  {site.siteUrl}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            size="sm"
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
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
