export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { LeafImagesTable } from "@/components/admin/leaf-images-table";
import { EmptyState } from "@/components/admin/empty-state";
import { Image } from "lucide-react";

export default async function LeafImagesPage() {
  const session = await auth();
  const isSuperAdmin = (session?.user as unknown as { role?: string })?.role === "SUPER_ADMIN";
  const images = await db.leafImage.findMany({
    orderBy: { uploadedAt: "desc" },
    take: 200,
    include: {
      user: { select: { fullName: true } },
      classification: { select: { diseaseClass: true, confidence: true } },
    },
  });

  return (
    <>
      <AdminTopbar title="Leaf Images" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {images.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No leaf images yet"
            description="Classifications will appear here once farmers begin capturing maize leaf images through the mobile application."
            action={{ label: "View the mobile app", href: "/#download" }}
          />
        ) : (
          <LeafImagesTable data={images} isSuperAdmin={isSuperAdmin} />
        )}
      </main>
    </>
  );
}
