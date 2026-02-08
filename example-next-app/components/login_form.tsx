'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { OIDCProvider } from '@/ory/kratos/flow/types/Provider';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { ProviderSelection } from '@/ory/kratos/ui/components/provider_selection';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { Message } from './ui/message';

interface LoginFormProps {
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  data: {
    email: {
      value: string;
      setValue: (email: string) => void;
      message?: UiTextMessage;
    };
    password: {
      value: string;
      setValue: (password: string) => void;
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

export function LoginForm({
  submitForm,
  data: { email, password },
  generalMessage,
  oidc,
  isLoading,
}: LoginFormProps) {
  return (
    <FlowForm
      title="Login to your account"
      description="Enter your email below to login to your account"
      submitForm={submitForm}
      messagesGeneral={generalMessage}
      buttonText="Login"
      isLoading={isLoading}
      bottomContent={
        <>
          {oidc && (
            <ProviderSelection
              providers={oidc.providers}
              onSubmit={oidc.onSubmit}
              message={oidc.message}
            />
          )}
          <FieldDescription className="text-center">
            Don&apos;t have an account? <a href="/auth/registration">Sign up</a>
          </FieldDescription>
        </>
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="max@mustermann.com"
            required
            value={email.value}
            onChange={(event) => {
              email.setValue(event.target.value);
            }}
          />
          <Message message={email.message} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/auth/recovery"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
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
      </FieldGroup>
    </FlowForm>
  );
}
