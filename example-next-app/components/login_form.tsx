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
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';

export function LoginForm({
  submitForm,
  identifier,
  setIdentifier,
  password,
  setPassword,
  messages,
  isLoading,
}: {
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  identifier: string;
  setIdentifier: (identifier: string) => void;
  password: string;
  setPassword: (password: string) => void;
  messages: any;
  isLoading: boolean;
}) {
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
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                  }}
                />
                {messages.identifier && (
                  <Label
                    className={
                      messages.identifier.type === 'error' ? 'text-red-500' : ''
                    }
                  >
                    {messages.identifier?.text}
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
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                />
                {messages.password && (
                  <Label
                    className={
                      messages.password.type === 'error' ? 'text-red-500' : ''
                    }
                  >
                    {messages.password?.text}
                  </Label>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : 'Login'}
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
