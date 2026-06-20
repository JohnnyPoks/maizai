export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { FeedbackTable } from "@/components/admin/feedback-table";
import { EmptyState } from "@/components/admin/empty-state";
import { MessageSquare } from "lucide-react";

export default async function FeedbackPage() {
  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <AdminTopbar title="Feedback" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {feedback.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No feedback yet"
            description="Bug reports and suggestions submitted from the mobile app will appear here."
          />
        ) : (
          <FeedbackTable data={feedback} />
        )}
      </main>
    </>
  );
}
