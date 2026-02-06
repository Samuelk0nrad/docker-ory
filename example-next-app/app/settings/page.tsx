import '@ory/elements-react/theme/styles.css';
import { SettingsPanel } from '@/app/settings/_component/settings_panel';

export default async function SettingsPage({
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
        <SettingsPanel flowId={flowId} />
      </div>
    </div>
  );
}
