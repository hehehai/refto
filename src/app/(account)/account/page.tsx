import { AccountsCard } from "@/components/features/account/accounts-card";
import { DeleteAccountCard } from "@/components/features/account/delete-account-card";
import { PasswordCard } from "@/components/features/account/password-card";
import { ProfileCard } from "@/components/features/account/profile-card";
import { getSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getSession();
  const user = session!.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings
        </p>
      </div>

      <ProfileCard user={user} />

      <PasswordCard />

      <AccountsCard />

      <DeleteAccountCard />
    </div>
  );
}
