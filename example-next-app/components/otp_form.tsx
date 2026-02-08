'use client';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { FlowForm } from '../ory/kratos/ui/flow_form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

interface OTPFormProps {
  /** The title displayed in the card header */
  title: string;
  /** The description displayed below the title */
  description: string;
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  data: {
    code: {
      value: string;
      setValue: (code: string) => void;
      message?: UiTextMessage;
    };
  };
  generalMessage?: UiTextMessage;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function OTPForm({
  title,
  description,
  submitForm,
  data: { code },
  generalMessage,
  isLoading,
}: OTPFormProps) {
  return (
    <FlowForm
      title={title}
      description={description}
      submitForm={submitForm}
      messagesGeneral={generalMessage}
      buttonText="Verify"
      isLoading={isLoading}
      bottomContent={
        <FieldDescription className="text-center">
          Didn&apos;t receive the code? <a href="#">Resend</a>
        </FieldDescription>
      }
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="otp">Verification code</FieldLabel>
          <InputOTP
            maxLength={6}
            id="otp"
            required
            value={code.value}
            onChange={(value) => {
              code.setValue(value);
            }}
          >
            <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            Enter the 6-digit code sent to your email.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FlowForm>
  );
}
