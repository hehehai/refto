import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { userProfileDialog } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { confirmDialog } from "./confirm-dialog";

export function UserProfileDialog() {
  return (
    <Dialog handle={userProfileDialog}>
      <DialogContent className="sm:max-w-md">
        <UserProfileContent />
      </DialogContent>
    </Dialog>
  );
}

function UserProfileContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch profile data
  const { data: profile, isLoading } = useQuery(
    orpc.app.user.getProfile.queryOptions()
  );

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    ...orpc.app.user.getSessions.queryOptions(),
    enabled: activeTab === "account",
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; image?: string | null }) =>
      queryClient.fetchQuery(
        orpc.app.user.updateProfile.queryOptions({ input: data })
      ),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () =>
      queryClient.fetchQuery(orpc.app.user.deleteAccount.queryOptions()),
    onSuccess: () => {
      toast.success("Account deleted");
      authClient.signOut();
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  // Handle delete account click
  const handleDeleteAccount = () => {
    confirmDialog.openWithPayload({
      title: "Delete Account",
      description:
        "Are you sure you want to delete your account? This action cannot be undone.",
      confirmText: "Delete Account",
      variant: "destructive",
      onConfirm: async () => {
        await deleteAccountMutation.mutateAsync();
      },
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="i-hugeicons-loading-01 animate-spin text-2xl text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Account Settings</DialogTitle>
        <DialogDescription>
          Manage your profile and account settings
        </DialogDescription>
      </DialogHeader>

      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent className="mt-4 space-y-4" value="profile">
          <ProfileForm
            isLoading={updateProfileMutation.isPending}
            onSubmit={(data) => updateProfileMutation.mutate(data)}
            profile={profile}
          />
        </TabsContent>

        {/* Account Tab */}
        <TabsContent className="mt-4 space-y-4" value="account">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
              <span className="i-hugeicons-mail-01 text-muted-foreground" />
              {profile.email}
              {profile.emailVerified && (
                <span className="i-hugeicons-checkmark-circle-01 ml-auto text-green-500" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sessions</Label>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  className={cn(
                    "rounded-md border p-3 text-sm",
                    session.isCurrent && "border-primary bg-primary/5"
                  )}
                  key={session.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {session.isCurrent ? "Current Session" : "Session"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {session.userAgent && (
                    <p className="mt-1 truncate text-muted-foreground text-xs">
                      {session.userAgent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Danger Tab */}
        <TabsContent className="mt-4 space-y-4" value="danger">
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4">
            <h3 className="font-medium text-destructive">Delete Account</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button
              className="mt-4"
              disabled={deleteAccountMutation.isPending}
              onClick={handleDeleteAccount}
              size="sm"
              variant="destructive"
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete Account"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

interface ProfileFormProps {
  profile: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  onSubmit: (data: { name?: string; image?: string | null }) => void;
  isLoading: boolean;
}

function ProfileForm({ profile, onSubmit, isLoading }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; image?: string | null } = {};

    if (name !== profile.name) {
      updates.name = name;
    }
    if (image !== (profile.image ?? "")) {
      updates.image = image || null;
    }

    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage alt={name} src={image || undefined} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Label htmlFor="image">Avatar URL</Label>
          <Input
            id="image"
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            type="url"
            value={image}
          />
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          onChange={(e) => setName(e.target.value)}
          required
          value={name}
        />
      </div>

      <DialogFooter>
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
