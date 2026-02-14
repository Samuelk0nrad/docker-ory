import { LoginPanel } from '@/app/auth/login/_component/login_panel';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: {
    flow?: string;
    return_to?: string;
  };
}) {
  const { flow: flowId, return_to: returnTo } = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginPanel flowId={flowId} returnTo={returnTo} />
      </div>
    </div>
  );
}
