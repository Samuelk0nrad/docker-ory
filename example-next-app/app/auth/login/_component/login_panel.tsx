'use client';

import { LoginForm } from '@/components/login_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { OIDCProvider } from '@/ory/kratos/flow/types/Provider';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { UpdateLoginFlowWithPasswordMethod } from '@ory/client';
import { useEffect } from 'react';

export function LoginPanel({ flowId, returnTo }: { flowId?: string; returnTo?: string }) {
  const authFlow = useAuthFlow<
    FlowTypeEnum.Login,
    UpdateLoginFlowWithPasswordMethod
  >(SelfServiceFlow.Login, flowId, 'password', returnTo);

  const submitForm = async (
    e?: React.SubmitEvent<HTMLFormElement>,
    method?: 'password' | 'oidc',
    provider?: OIDCProvider
  ) => {
    e?.preventDefault();
    const success =
      method === 'oidc'
        ? await authFlow.updateFlow(
          authFlow.createProviderSubmitData(provider!)
        )
        : await authFlow.updateFlow();
    if (success) {
      authFlow.resetFlowData();
    }
  };

  useEffect(() => {
    authFlow.setMethod('password');
  }, [flowId, authFlow]);

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
      oidc={{
        providers: authFlow.mapProvider(),
        onSubmit: (provider) => submitForm(undefined, 'oidc', provider),
        message: authFlow.messages.oidc,
      }}
      generalMessage={authFlow.messages.general}
      isLoading={authFlow.isLoading}
    />
  );
}
