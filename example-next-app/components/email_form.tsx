'use client';

import { FieldDescription } from '@/components/ui/field';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { EmailInput } from '@/ory/kratos/ui/components/email_input';
import { FlowForm } from '../ory/kratos/ui/flow_form';

interface EmailFormProps {
  /** The title displayed in the card header */
  title: string;
  /** The description displayed below the title */
  description: string;
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  /** Current email input value */
  email: string;
  /** Callback to update email value */
  setEmail: (email: string) => void;

  /** Validation and status messages for the form */
  messagesEmail?: UiTextMessage;
  messagesGeneral?: UiTextMessage;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function EmailForm({
  title,
  description,
  submitForm,
  email,
  setEmail,
  messagesEmail,
  messagesGeneral,
  isLoading,
}: EmailFormProps) {
  return (
    <FlowForm
      title={title}
      description={description}
      submitForm={submitForm}
      messagesGeneral={messagesGeneral}
      buttonText="Recover"
      isLoading={isLoading}
      bottomContent={
        <FieldDescription className="text-center">
          Remembered your account?
          <a href="/auth/login">Sign in</a>
        </FieldDescription>
      }
    >
      <EmailInput value={email} setValue={setEmail} message={messagesEmail} />
    </FlowForm>
  );
}
