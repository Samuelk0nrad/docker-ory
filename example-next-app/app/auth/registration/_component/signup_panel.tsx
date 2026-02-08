'use client';

import { SignupForm } from '@/components/signup_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { UpdateRegistrationFlowWithPasswordMethod } from '@ory/client';

type SignupData = UpdateRegistrationFlowWithPasswordMethod & {
  uiOnly?: {
    confirmPassword?: string;
  };
  traits?: {
    email?: string;
    name?: string;
  };
};

export function SignupPanel({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow<FlowTypeEnum.Registration, SignupData>(
    SelfServiceFlow.Registration,
    flowId,
    'password'
  );

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (authFlow.data.password !== authFlow.data.uiOnly?.confirmPassword) {
      authFlow.setMessages('confirmPassword', {
        text: 'Passwords do not match',
        type: 'error',
      });
      return;
    }

    authFlow.updateFlow();
  };

  return (
    <SignupForm
      submitForm={submitForm}
      data={{
        email: {
          value: authFlow.data.traits?.email || '',
          setValue: (value) => authFlow.setData('traits.email', value),
          message: authFlow.messages.email,
        },
        name: {
          value: authFlow.data.traits?.name || '',
          setValue: (value) => authFlow.setData('traits.name', value),
          message: authFlow.messages.name,
        },
        password: {
          value: authFlow.data.password || '',
          setValue: (value) => authFlow.setData('password', value),
          message: authFlow.messages.password,
        },
        confirmPassword: {
          value: authFlow.data.uiOnly?.confirmPassword || '',
          setValue: (value) =>
            authFlow.setData('uiOnly.confirmPassword', value),
          message: authFlow.messages.confirmPassword,
        },
      }}
      generalMessage={authFlow.messages.general}
      isLoading={authFlow.isLoading}
    />
  );
}
