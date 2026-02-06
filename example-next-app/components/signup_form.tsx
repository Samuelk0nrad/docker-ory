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
import { Input } from './ui/input';

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
  messages,
  isLoading,
}: {
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (email: string) => void;
  name: string;
  setName: (name: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  messages: any;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm(e);
          }}
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
              {messages.name && (
                <Label
                  className={
                    messages.name.type === 'error' ? 'text-red-500' : ''
                  }
                >
                  {messages.name.text}
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {messages.email ? (
                <Label
                  className={
                    messages.email.type === 'error' ? 'text-red-500' : ''
                  }
                >
                  {messages.email.text}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {messages.password ? (
                <Label
                  className={
                    messages.password.type === 'error' ? 'text-red-500' : ''
                  }
                >
                  {messages.password.text}
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
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {messages.confirmPassword && (
                <Label
                  className={
                    messages.confirmPassword.type === 'error'
                      ? 'text-red-500'
                      : ''
                  }
                >
                  {messages.confirmPassword.text}
                </Label>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">
                  {isLoading ? <Spinner /> : 'Create Account'}
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
