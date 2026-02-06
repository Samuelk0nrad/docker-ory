'use client';

import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { useEffect } from 'react';
import { SignupForm } from '@/components/signup_form';

export function SignupPanel({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow(flowId, SelfServiceFlow.Registration);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (authFlow.data.password !== authFlow.data.confirmPassword) {
      authFlow.setMessages('confirmPassword', {
        text: 'Passwords do not match',
        type: 'error',
      });
      return;
    }

    authFlow.updateFlow();
  };

  useEffect(() => {
    authFlow.setMethod('password');
  }, [flowId]);

  return (
    <SignupForm
      submitForm={submitForm}
      email={authFlow.data.email || ''}
      setEmail={(value) => authFlow.setData('email', value)}
      name={authFlow.data.name || ''}
      setName={(value) => authFlow.setData('name', value)}
      password={authFlow.data.password || ''}
      setPassword={(value) => authFlow.setData('password', value)}
      confirmPassword={authFlow.data.confirmPassword || ''}
      setConfirmPassword={(value) => authFlow.setData('confirmPassword', value)}
      messages={authFlow.messages}
      isLoading={authFlow.isLoading}
    />
  );
}
