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
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';

export function PasswordChangeForm({
  submitForm,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  messages,
  isLoading,
}: {
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  messages: any;
  isLoading: boolean;
}) {
  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        <CardHeader>
          <CardTitle>Change your password</CardTitle>
          <CardDescription>
            Enter your new password below to update your account, or use google
            to login.
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                  }}
                />
                {messages.confirmPassword && (
                  <Label
                    className={
                      messages.confirmPassword.type === 'error'
                        ? 'text-red-500'
                        : ''
                    }
                  >
                    {messages.confirmPassword?.text}
                  </Label>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : 'Change Password'}
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
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
