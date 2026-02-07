'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { Input } from './ui/input';
import { Message } from './ui/message';

interface SignupFormProps {
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  /** Current input values */
  email: string;
  name: string;
  password: string;
  confirmPassword: string;

  /** Callback to update values */
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;

  /** Validation and status messages for the form */
  messagesEmail?: UiTextMessage;
  messagesName?: UiTextMessage;
  messagesPassword?: UiTextMessage;
  messagesConfirmPassword?: UiTextMessage;
  messagesGeneral?: UiTextMessage;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function SignupForm({
  submitForm,
  email,
  setEmail,
  name,
  setName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  messagesEmail,
  messagesName,
  messagesPassword,
  messagesConfirmPassword,
  messagesGeneral,
  isLoading,
}: SignupFormProps) {
  return (
    <FlowForm
      title="Create an account"
      description="Enter your information below to create your account"
      submitForm={submitForm}
      messagesGeneral={messagesGeneral}
      buttonText="Create Account"
      isLoading={isLoading}
      bottomContent={
        <>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign up with Google
          </button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/auth/login">Sign in</a>
          </FieldDescription>
        </>
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Message message={messagesName} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Message
            message={messagesEmail}
            content={
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Message
            message={messagesPassword}
            content={
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Message message={messagesConfirmPassword} />
        </Field>
      </FieldGroup>
    </FlowForm>
  );
}
