import { AppSidebar } from "@/components/AppSidebar";
import { ClaimReviewWorkflow } from "@/components/ClaimReviewWorkflow";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--cg-bg)] text-[var(--cg-text)]">
      <div className="grid min-h-screen lg:grid-cols-[232px_minmax(0,1fr)]">
        <AppSidebar />
        <div className="min-w-0 px-4 py-4 sm:px-6">
          <ClaimReviewWorkflow />
        </div>
      </div>
    </main>
  );
}
