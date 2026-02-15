'use client';

import { EmailForm } from '@/components/email_form';
import { OTPForm } from '@/components/otp_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { UpdateRecoveryFlowWithCodeMethod } from '@ory/client';
import { useEffect } from 'react';

export function RecoveryPanel({ flowId }: { flowId?: string }) {
  const authFlow = useAuthFlow<
    FlowTypeEnum.Recovery,
    UpdateRecoveryFlowWithCodeMethod
  >(SelfServiceFlow.Recovery, flowId, 'code');

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    await authFlow.updateFlow();
  };

  useEffect(() => {
    if (authFlow.flow.flow?.state === 'sent_email') {
      authFlow.setData('email', '');
    }
  }, [authFlow.flow.flow?.state, authFlow]);

  if (authFlow.flow.flow?.state === 'choose_method') {
    return (
      <EmailForm
        title="Recover your account"
        description="Enter your email below to recover your account"
        submitForm={submitForm}
        data={{
          email: {
            value: authFlow.data.email || '',
            setValue: (value) => authFlow.setData('email', value),
            message: authFlow.messages.email,
          },
        }}
        generalMessage={authFlow.messages.general}
        isLoading={authFlow.isLoading}
      />
    );
  } else if (authFlow.flow.flow?.state === 'sent_email') {
    return (
      <OTPForm
        title="Enter verification code"
        description="We sent a 6-digit code to your email."
        submitForm={submitForm}
        data={{
          code: {
            value: authFlow.data.code || '',
            setValue: (value) => authFlow.setData('code', value),
            message: authFlow.messages.code,
          },
        }}
        generalMessage={authFlow.messages.general}
        isLoading={authFlow.isLoading}
      />
    );
  }
}
