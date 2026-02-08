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
      data={{
        email: {
          value: authFlow.data.identifier || '',
          setValue: (value) => authFlow.setData('identifier', value),
          message: authFlow.messages.email,
        },
        password: {
          value: authFlow.data.password || '',
          setValue: (value) => authFlow.setData('password', value),
          message: authFlow.messages.password,
        },
      }}
      generalMessage={authFlow.messages.general}
      isLoading={authFlow.isLoading}
    />
  );
}
