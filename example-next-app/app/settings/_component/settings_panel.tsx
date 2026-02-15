'use client';

import { OneButtonForm } from '@/components/one_button_form';
import { PasswordChangeForm } from '@/components/passwor_change_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { UpdateSettingsFlowWithPasswordMethod } from '@ory/client';
import { useRouter } from 'next/navigation';

type SettingsData = UpdateSettingsFlowWithPasswordMethod & {
  uiOnly?: {
    confirmPassword?: string;
  };
};

export function SettingsPanel({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const authFlow = useAuthFlow<FlowTypeEnum.Settings, SettingsData>(
    SelfServiceFlow.Settings,
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
    } else {
      authFlow.setMessages('confirmPassword', { text: '', type: 'info' });
    }

    const success = await authFlow.updateFlow();

    if (success) {
      authFlow.resetFlowData();
    }
  };

  if (
    authFlow.flow.flow?.ui?.messages?.some(
      (m) => (m.context as Record<string, unknown>)?.privilegedSessionExpiresAt
    )
  ) {
    return (
      <PasswordChangeForm
        submitForm={submitForm}
        data={{
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
  } else if (authFlow.flow.flow?.state === 'success') {
    return (
      <OneButtonForm
        title="Your Password Has Been Changed Successfully"
        description="You are now logged in"
        buttonText="Continue to homepage"
        onClick={() => router.push('/')}
        isLoading={authFlow.isLoading}
      />
    );
  } else {
    return (
      <OneButtonForm
        title="not implemented yet"
        description=""
        buttonText="Continue to homepage"
        onClick={() => router.push('/')}
        isLoading={authFlow.isLoading}
      />
    );
  }
}
