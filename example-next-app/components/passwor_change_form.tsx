'use client';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { OIDCProvider } from '@/ory/kratos/flow/types/Provider';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { ProviderSelection } from '@/ory/kratos/ui/components/provider_selection';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { Message } from './ui/message';

interface PasswordChangeFormProps {
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  data: {
    password: {
      value: string;
      setValue: (password: string) => void;
      message?: UiTextMessage;
    };
    confirmPassword: {
      value: string;
      setValue: (confirmPassword: string) => void;
      message?: UiTextMessage;
    };
  };
  generalMessage?: UiTextMessage;

  oidc?: {
    onSubmit: (provider: OIDCProvider) => void;
    message?: UiTextMessage;
    providers: OIDCProvider[];
  };

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function PasswordChangeForm({
  submitForm,
  data: { password, confirmPassword },
  generalMessage,
  oidc,
  isLoading,
}: PasswordChangeFormProps) {
  return (
    <FlowForm
      title="Change your password"
      description="Enter your new password below to update your account, or use google to login."
      submitForm={submitForm}
      messagesGeneral={generalMessage}
      buttonText="Change Password"
      isLoading={isLoading}
      bottomContent={
        oidc && (
          <ProviderSelection
            providers={oidc.providers}
            onSubmit={oidc.onSubmit}
            message={oidc.message}
          />
        )
      }
    >
      <FieldGroup>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">New Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password.value}
            onChange={(event) => {
              password.setValue(event.target.value);
            }}
          />
          <Message message={password.message} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          </div>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword.value}
            onChange={(event) => {
              confirmPassword.setValue(event.target.value);
            }}
          />
          <Message message={confirmPassword.message} />
        </Field>
      </FieldGroup>
    </FlowForm>
  );
}
