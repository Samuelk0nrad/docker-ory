'use client';

import { FieldGroup } from '@/components/ui/field';
import { Message } from '@/components/ui/message';
import { OIDCProvider } from '../../flow/types/Provider';
import { UiTextMessage } from '../../flow/types/UiTextMessage';

interface ProviderSelectionProps {
  onSubmit: (provider: OIDCProvider) => void;
  message?: UiTextMessage;
  providers: OIDCProvider[];
}

export function ProviderSelection({
  onSubmit,
  message,
  providers,
}: ProviderSelectionProps) {
  return (
    <FieldGroup>
      {providers.map((provider) => {
        switch (provider.name) {
          case 'google':
            return (
              <div className="flex gap-2 flex-col">
                <button
                  type="button"
                  onClick={() => onSubmit(provider)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  Login with Google
                </button>
              </div>
            );
          default:
            return null;
        }
      })}
      <Message message={message} />
    </FieldGroup>
  );
}
