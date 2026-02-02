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
import { kratos, RegistrationFlowPayload, ResponseUI } from '@/ory/kratos';
import { AxiosError } from 'axios';
import { LoginFlow } from '@ory/client';
import { useEffect, useState } from 'react';
import { getCsrfToken } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { Spinner } from './ui/spinner';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';

export function SignupForm({ flowId }: { flowId?: string }) {
  const [flow, setFlow] = useState<LoginFlow>();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Registration);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setIsLoading(true);
    const isValid = await validateInput();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    const body: RegistrationFlowPayload = {
      method: 'password',
      traits: {
        email: email,
        name: name,
      },
      password: password,
      csrf_token: getCsrfToken(flow),
    };

    try {
      await kratos.updateRegistrationFlow({
        flow: flow!.id,
        updateRegistrationFlowBody: body,
      });
      setMessage('');
    } catch (e: unknown) {
      handleRegistrationError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const responseUi: ResponseUI = error.response?.data?.ui;
      if (responseUi?.messages?.length > 0) {
        const message = responseUi.messages[0];
        console.error(responseUi.messages[0].text);
        setMessage(message.text);
      }
      if (responseUi.nodes?.length > 0) {
        const nodes = responseUi.nodes;
        nodes.forEach((node: any) => {
          if (
            node.attributes.name === 'identifier' &&
            node.messages.length > 0
          ) {
            setEmailError(node.messages[0].text);
          }
          if (node.attributes.name === 'password' && node.messages.length > 0) {
            setPasswordError(node.messages[0].text);
          }
          if (node.attributes.name === 'name' && node.messages.length > 0) {
            setNameError(node.messages[0].text);
          }
        });
      }
    } else {
      console.error(error);
      setMessage('an error occurred, please try again later');
    }
  };

  const validateInput = async (): Promise<boolean> => {
    if (!flow) {
      try {
        await getRegistrationFlow();
      } catch (e: unknown) {
        console.error('Failed to get registration flow', e);
        setMessage('an error occurred, please try again later');
        return false;
      }
    } else {
      setMessage('');
    }

    if (email === '') {
      setEmailError('Email is required');
      return false;
    } else {
      setEmailError('');
    }
    if (name === '') {
      setNameError('Name is required');
      return false;
    } else {
      setNameError('');
    }
    if (password === '') {
      setPasswordError('Password is required');
      return false;
    } else {
      setPasswordError('');
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
    }
    return true;
  };

  const getRegistrationFlow = async () => {
    try {
      if (!flowId) {
        const { data } = await kratos.createBrowserRegistrationFlow();
        setFlow(data);
        console.log(data);
      } else {
        const { data } = await kratos.getRegistrationFlow({ id: flowId });
        setFlow(data);
        console.log(data);
      }
      setMessage('');
    } catch (e) {
      console.error('Failed to get registration flow', e);
      setMessage('an error occurred, please try again later');
    }
  };

  useEffect(() => {
    getRegistrationFlow();
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
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              {nameError && (
                <Label className={'text-red-500'}>{nameError}</Label>
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
              {emailError ? (
                <Label className={'text-red-500'}>{emailError}</Label>
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
              {passwordError ? (
                <Label className={'text-red-500'}>{passwordError}</Label>
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
              {confirmPasswordError ? (
                <Label className={'text-red-500'}>{confirmPasswordError}</Label>
              ) : (
                <FieldDescription>
                  Please confirm your password.
                </FieldDescription>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">
                  {isLoading ? <Spinner /> : 'Create Account'}
                </Button>
                {message && <Label className={'text-red-500'}>{message}</Label>}
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
