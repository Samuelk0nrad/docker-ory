'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

export function OTPForm({
  title,
  description,
  submitForm,
  code,
  setCode,
  messages,
  isLoading,
}: {
  title: string;
  description: string;
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  code: string;
  setCode: (code: string) => void;
  messages: any;
  isLoading: boolean;
}) {
  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitForm}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                <InputOTP
                  maxLength={6}
                  id="otp"
                  required
                  value={code}
                  onChange={(value) => {
                    setCode(value);
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
              <FieldGroup>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : 'Verify'}
                </Button>
                {messages.general && (
                  <Label
                    className={
                      messages.general.type === 'error' ? 'text-red-500' : ''
                    }
                  >
                    {messages.general.text}
                  </Label>
                )}
                <FieldDescription className="text-center">
                  Didn&apos;t receive the code? <a href="#">Resend</a>
                </FieldDescription>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
