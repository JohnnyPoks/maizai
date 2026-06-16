export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { Topbar } from "@/components/admin/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <>
      <Topbar
        title="Settings"
        userEmail={session?.user?.email ?? undefined}
        userName={session?.user?.name ?? undefined}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-xl">
        <Card className="border-brand-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-brand-800">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-earth-600">
            <p>
              Signed in as <strong>{session?.user?.email}</strong>
            </p>
            <p className="text-xs text-earth-400">
              To change your password, contact the database administrator and update the
              password hash in the <code className="font-mono">User</code> table.
            </p>
          </CardContent>
        </Card>

        <Card className="border-brand-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-brand-800">Environment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-earth-600 space-y-1">
            <p>Next.js {process.env.NEXT_RUNTIME ?? "server"} runtime</p>
            <p className="text-xs text-earth-400">
              Configure environment variables via Vercel project settings or your local{" "}
              <code className="font-mono">.env.local</code> file.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
