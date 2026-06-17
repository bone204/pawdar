import { VerifyEmailPage } from "@/presentation/pages/auth/VerifyEmailPage";

interface VerifyEmailEntryPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailEntryPage({
  searchParams,
}: VerifyEmailEntryPageProps) {
  const { token } = await searchParams;
  return <VerifyEmailPage token={token} />;
}
