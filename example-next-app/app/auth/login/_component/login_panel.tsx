'use client';

import { LoginForm } from '@/components/login_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { UpdateLoginFlowWithPasswordMethod } from '@ory/client';
import { useEffect } from 'react';

export function LoginPanel({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow<
    FlowTypeEnum.Login,
    UpdateLoginFlowWithPasswordMethod
  >(SelfServiceFlow.Login, flowId, 'password');

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
      email={authFlow.data.identifier || ''}
      setEmail={(value) => authFlow.setData('identifier', value)}
      password={authFlow.data.password || ''}
      setPassword={(value) => authFlow.setData('password', value)}
      messagesGeneral={authFlow.messages.general}
      messagesEmail={authFlow.messages.email}
      messagesPassword={authFlow.messages.password}
      isLoading={authFlow.isLoading}
    />
  );
}
