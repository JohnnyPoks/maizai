import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/admin/topbar";

interface AdminTopbarProps {
  title: string;
}

export async function AdminTopbar({ title }: AdminTopbarProps) {
  const session = await auth();
  const role = (session?.user as unknown as { role?: string })?.role ?? "FARMER";

  const pendingCount =
    role === "SUPER_ADMIN"
      ? await db.accessRequest.count({ where: { status: "PENDING" } })
      : 0;

  return (
    <Topbar
      title={title}
      userEmail={session?.user?.email ?? undefined}
      userName={session?.user?.name ?? undefined}
      userRole={role}
      pendingAccessRequests={pendingCount}
    />
  );
}
