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
import { Label } from '@radix-ui/react-label';
import { Spinner } from './ui/spinner';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { useEffect } from 'react';

export function SignupForm({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Registration);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    authFlow.updateFlow();
  };

  useEffect(() => {
    authFlow.setMethod('password');
  }, [flowId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitForm}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={authFlow.data.traits?.name || ''}
                onChange={(event) =>
                  authFlow.setData('traits.name', event.target.value)
                }
                required
              />
              {authFlow.messages.name && (
                <Label
                  className={
                    authFlow.messages.name.type === 'error'
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {authFlow.messages.name.text}
                </Label>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={authFlow.data.traits?.email || ''}
                onChange={(event) =>
                  authFlow.setData('traits.email', event.target.value)
                }
              />
              {authFlow.messages.email ? (
                <Label
                  className={
                    authFlow.messages.email.type === 'error'
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {authFlow.messages.email.text}
                </Label>
              ) : (
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={authFlow.data.password || ''}
                onChange={(event) =>
                  authFlow.setData('password', event.target.value)
                }
              />
              {authFlow.messages.password ? (
                <Label
                  className={
                    authFlow.messages.password.type === 'error'
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {authFlow.messages.password.text}
                </Label>
              ) : (
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={authFlow.data.confirmPassword || ''}
                onChange={(event) =>
                  authFlow.setData('confirmPassword', event.target.value)
                }
              />
              {authFlow.messages.confirmPassword && (
                <Label
                  className={
                    authFlow.messages.confirmPassword.type === 'error'
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {authFlow.messages.confirmPassword.text}
                </Label>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">
                  {authFlow.isLoading ? <Spinner /> : 'Create Account'}
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
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/auth/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
