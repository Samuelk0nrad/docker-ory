'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { PasswordChangeForm } from '@/components/passwor_change_form';
import { UpdateSettingsFlowWithPasswordMethod } from '@ory/client';

export function SettingsPanel({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const authFlow = useAuthFlow(SelfServiceFlow.Settings, flowId);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const data = authFlow.data as Partial<UpdateSettingsFlowWithPasswordMethod>;

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const success = await authFlow.updateFlow();

    if (data.password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
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
      <PasswordChangeForm
        submitForm={submitForm}
        password={data.password || ''}
        setPassword={(value) => authFlow.setData('password', value)}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        messages={{
          ...authFlow.messages,
          ...(confirmPasswordError
            ? { confirmPassword: { text: confirmPasswordError, type: 'error' } }
            : {}),
        }}
        isLoading={authFlow.isLoading}
      />
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
