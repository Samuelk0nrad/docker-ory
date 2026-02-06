import { VerificationForm } from './_component/verification-form';

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: {
    flow?: string;
  };
}) {
  const { flow: flowId } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VerificationForm flowId={flowId} />
      </div>
    </div>
  );
}
