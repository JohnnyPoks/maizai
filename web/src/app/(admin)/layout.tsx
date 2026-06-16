import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { db } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const mustChangePassword = (session.user as unknown as { mustChangePassword?: boolean })?.mustChangePassword;
  if (mustChangePassword) redirect("/change-password");

  const role = (session.user as unknown as { role?: string })?.role ?? "FARMER";

  const pendingCount = role === "SUPER_ADMIN"
    ? await db.accessRequest.count({ where: { status: "PENDING" } })
    : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden" data-role={role} data-pending={pendingCount}>
        {children}
      </div>
    </div>
  );
}
