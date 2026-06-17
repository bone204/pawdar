import { Suspense } from "react";
import { VerifyEmailPage } from "@/presentation/pages/auth/VerifyEmailPage";

export default function VerifyEmailEntryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-radial from-primary/5 via-transparent to-transparent">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  );
}
