'use client';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { Message } from './ui/message';

interface PasswordChangeFormProps {
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  /** Current input values */
  password: string;
  confirmPassword: string;

  /** Callback to update values */
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;

  /** Validation and status messages for the form */
  messagesPassword?: UiTextMessage;
  messagesConfirmPassword?: UiTextMessage;
  messagesGeneral?: UiTextMessage;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function PasswordChangeForm({
  submitForm,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  messagesPassword,
  messagesConfirmPassword,
  messagesGeneral,
  isLoading,
}: PasswordChangeFormProps) {
  return (
    <FlowForm
      title="Change your password"
      description="Enter your new password below to update your account, or use google to login."
      submitForm={submitForm}
      messagesGeneral={messagesGeneral}
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
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <Message message={messagesPassword} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          </div>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
          <Message message={messagesConfirmPassword} />
        </Field>
      </FieldGroup>
    </FlowForm>
  );
}
