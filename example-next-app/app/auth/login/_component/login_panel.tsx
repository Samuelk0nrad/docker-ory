'use client';

import { useEffect } from 'react';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { LoginForm } from '@/components/login_form';

export function LoginPanel({ flowId }: { flowId?: string }) {
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
    <LoginForm
      submitForm={submitForm}
      identifier={authFlow.data.identifier || ''}
      setIdentifier={(value) => authFlow.setData('identifier', value)}
      password={authFlow.data.password || ''}
      setPassword={(value) => authFlow.setData('password', value)}
      messages={authFlow.messages}
      isLoading={authFlow.isLoading}
    />
  );
}
