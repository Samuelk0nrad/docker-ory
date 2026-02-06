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
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';
import { Spinner } from '../../../../components/ui/spinner';
import { Label } from '../../../../components/ui/label';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';

export function LoginForm({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Login);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const success = await authFlow.updateFlow();
    if (success) {
      authFlow.resetFlowData();
    }
  };

  useEffect(() => {
    authFlow.setMethod('password');
  }, [flowId]);

  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                  value={authFlow.data.identifier || ''}
                  onChange={(event) => {
                    authFlow.setData('identifier', event.target.value);
                  }}
                />
                {authFlow.messages.identifier && (
                  <Label
                    className={
                      authFlow.messages.identifier.type === 'error'
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {authFlow.messages.identifier?.text}
                  </Label>
                )}
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
                <Button type="submit" disabled={authFlow.isLoading}>
                  {authFlow.isLoading ? <Spinner /> : 'Login'}
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
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <a href="/auth/registration">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
