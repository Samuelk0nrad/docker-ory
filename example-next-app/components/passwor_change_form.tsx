'use client';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
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

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function PasswordChangeForm({
  submitForm,
  data: { password, confirmPassword },
  generalMessage,
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
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Login with Google
        </button>
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
