'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { Message } from './ui/message';

interface LoginFormProps {
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;

  /** Current input values */
  email: string;
  password: string;

  /** Callback to update values */
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;

  /** Validation and status messages for the form */
  messagesEmail?: UiTextMessage;
  messagesPassword?: UiTextMessage;
  messagesGeneral?: UiTextMessage;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function LoginForm({
  submitForm,
  email,
  setEmail,
  password,
  setPassword,
  messagesEmail,
  messagesPassword,
  messagesGeneral,
  isLoading,
}: LoginFormProps) {
  return (
    <FlowForm
      title="Login to your account"
      description="Enter your email below to login to your account"
      submitForm={submitForm}
      messagesGeneral={messagesGeneral}
      buttonText="Login"
      isLoading={isLoading}
      bottomContent={
        <>
          <div className="flex gap-2 flex-col">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Login with Google
            </button>
          </div>
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
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
          <Message message={messagesEmail} />
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
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <Message message={messagesPassword} />
        </Field>
      </FieldGroup>
    </FlowForm>
  );
}
