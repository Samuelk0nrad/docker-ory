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

export function EmailForm({
  title,
  description,
  submitForm,
  email,
  setEmail,
  messages,
  isLoading,
}: {
  title: string;
  description: string;
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  email: string;
  setEmail: (email: string) => void;
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@mustermann.com"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                />
                {messages.email && (
                  <Label
                    className={
                      messages.email.type === 'error' ? 'text-red-500' : ''
                    }
                  >
                    {messages.email?.text}
                  </Label>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : 'Recover'}
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
}
