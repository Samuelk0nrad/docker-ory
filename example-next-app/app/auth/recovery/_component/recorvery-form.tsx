'use client';

import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { Label } from '@radix-ui/react-label';
import { Button } from '../../../../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../../components/ui/card';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from '../../../../components/ui/field';
import { Input } from '../../../../components/ui/input';
import { Spinner } from '../../../../components/ui/spinner';
import { useEffect } from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '../../../../components/ui/input-otp';

export function RecoveryForm({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Recovery);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    await authFlow.updateFlow();
  };

  useEffect(() => {
    authFlow.setMethod('code');
  }, [flowId]);

  useEffect(() => {
    if (authFlow.flow.flow?.state === 'sent_email') {
      authFlow.setData('email', '');
    }
  }, [authFlow.flow.flow?.state]);

  if (authFlow.flow.flow?.state === 'choose_method') {
    return (
      <div className={'flex flex-col gap-6'}>
        <Card>
          <CardHeader>
            <CardTitle>Recover your account</CardTitle>
            <CardDescription>
              Enter your email below to recover your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitForm}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="max@mustermann.com"
                    required
                    value={authFlow.data.email || ''}
                    onChange={(event) => {
                      authFlow.setData('email', event.target.value);
                    }}
                  />
                  {authFlow.messages.email && (
                    <Label
                      className={
                        authFlow.messages.email.type === 'error'
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {authFlow.messages.email?.text}
                    </Label>
                  )}
                </Field>
                <Field>
                  <Button type="submit" disabled={authFlow.isLoading}>
                    {authFlow.isLoading ? <Spinner /> : 'Recover'}
                  </Button>
                  {authFlow.messages.general && (
                    <Label
                      className={
                        authFlow.messages.general.type === 'error'
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {authFlow.messages.general.text}
                    </Label>
                  )}
                  <FieldDescription className="text-center">
                    Remembered your account?
                    <a href="/auth/login">Sign in</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  } else if (authFlow.flow.flow?.state === 'sent_email') {
    return (
      <div className={'flex flex-col gap-6'}>
        <Card>
          <CardHeader>
            <CardTitle>Enter verification code</CardTitle>
            <CardDescription>
              We sent a 6-digit code to your email.
            </CardDescription>
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
                    value={authFlow.data.code || ''}
                    onChange={(value) => {
                      authFlow.setData('code', value);
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
                  <Button type="submit">Verify</Button>
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
}
