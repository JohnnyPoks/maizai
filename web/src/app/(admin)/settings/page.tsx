export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SettingsClient } from "@/components/admin/settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role ?? "FARMER";

  return (
    <>
      <AdminTopbar title="Settings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-2xl">
        <SettingsClient
          userEmail={session?.user?.email ?? ""}
          userName={session?.user?.name ?? ""}
          userRole={role}
        />
      </main>
    </>
  );
}
