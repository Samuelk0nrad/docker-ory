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
      email={authFlow.data.traits?.email || ''}
      setEmail={(value) => authFlow.setData('traits.email', value)}
      name={authFlow.data.traits?.name || ''}
      setName={(value) => authFlow.setData('traits.name', value)}
      password={authFlow.data.password || ''}
      setPassword={(value) => authFlow.setData('password', value)}
      confirmPassword={authFlow.data.uiOnly?.confirmPassword || ''}
      setConfirmPassword={(value) =>
        authFlow.setData('uiOnly.confirmPassword', value)
      }
      messagesConfirmPassword={authFlow.messages.confirmPassword}
      messagesEmail={authFlow.messages.email}
      messagesName={authFlow.messages.name}
      messagesPassword={authFlow.messages.password}
      messagesGeneral={authFlow.messages.general}
      isLoading={authFlow.isLoading}
    />
  );
}
