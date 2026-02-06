'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../components/ui/spinner';
import { Label } from '../../../components/ui/label';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';

export function SettingsForm({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Settings);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const success = await authFlow.updateFlow();

    if (authFlow.data.password !== authFlow.data.confirmPassword) {
      authFlow.setMessages('confirmPassword', {
        text: 'Passwords do not match',
        type: 'error',
      });
      return;
    } else {
      authFlow.setMessages('confirmPassword', undefined);
    }

    if (success) {
      authFlow.resetFlowData();
    }
  };

  useEffect(() => {
    authFlow.setMethod('password');
  }, [flowId]);

  if (
    authFlow.flow.flow?.ui?.messages?.some(
      (m) => (m.context as any)?.privilegedSessionExpiresAt
    )
  ) {
    return (
      <div className={'flex flex-col gap-6'}>
        <Card>
          <CardHeader>
            <CardTitle>Change your password</CardTitle>
            <CardDescription>
              Enter your new password below to update your account, or use
              google to login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitForm}>
              <FieldGroup>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">New Password</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={authFlow.data.password || ''}
                    onChange={(event) => {
                      authFlow.setData('password', event.target.value);
                    }}
                  />
                  {authFlow.messages.password && (
                    <Label
                      className={
                        authFlow.messages.password.type === 'error'
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {authFlow.messages.password?.text}
                    </Label>
                  )}
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={authFlow.data.confirmPassword || ''}
                    onChange={(event) => {
                      authFlow.setData('confirmPassword', event.target.value);
                    }}
                  />
                  {authFlow.messages.confirmPassword && (
                    <Label
                      className={
                        authFlow.messages.confirmPassword.type === 'error'
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {authFlow.messages.confirmPassword?.text}
                    </Label>
                  )}
                </Field>
                <Field>
                  <Button type="submit" disabled={authFlow.isLoading}>
                    {authFlow.isLoading ? <Spinner /> : 'Change Password'}
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
                  <Button variant="outline" type="button">
                    Login with Google
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  } else if (authFlow.flow.flow?.state === 'success') {
    return (
      <div className={'flex flex-col gap-6'}>
        <Card>
          <CardHeader>
            <CardTitle>Your Password Has Been Changed Successfully</CardTitle>
            <CardDescription>You are now logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Button
                  type="button"
                  onClick={() => {
                    router.push('/');
                  }}
                  disabled={authFlow.isLoading}
                >
                  Continue to homepage
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return <div className={'flex flex-col gap-6'}>not implemented yet</div>;
  }
}
