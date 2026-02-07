'use client';

import { OTPForm } from '@/components/otp_form';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { FlowTypeEnum } from '@/ory/kratos/flow/types/FlowTypes';
import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { OneButtonForm } from '@/components/one_button_form';
import { UpdateVerificationFlowWithCodeMethod } from '@ory/client';

export function VerificationPanel({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const authFlow = useAuthFlow<
    FlowTypeEnum.Verification,
    UpdateVerificationFlowWithCodeMethod
  >(SelfServiceFlow.Verification, flowId, 'code');

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    authFlow.updateFlow();
  };

  useEffect(() => {
    if (authFlow.flow.flow?.state === 'passed_challenge') {
      router.push('/');
    }
  }, [authFlow.flow.flow?.state]);

  if (
    authFlow.messages.general &&
    'id' in authFlow.messages.general &&
    authFlow.messages.general.id === 4070002
  ) {
    return (
      <OneButtonForm
        title="Your Email Has Been already Verified Successfully"
        description="Please click the button below to continue to the homepage."
        buttonText="Continue to homepage"
        onClick={() => router.push('/')}
        isLoading={authFlow.isLoading}
      />
    );
  } else if (authFlow.flow.flow?.state === 'choose_method') {
    return (
      <OTPForm
        title="Enter verification code"
        description="We sent a 6-digit code to your email."
        submitForm={submitForm}
        code={authFlow.data.code || ''}
        setCode={(value) => authFlow.setData('code', value)}
        messagesCode={authFlow.messages.code}
        messagesGeneral={authFlow.messages.general}
        isLoading={authFlow.isLoading}
      />
    );
  } else {
    return (
      <OneButtonForm
        title="Your Email Has Been Verified Successfully"
        description=""
        buttonText="Continue to homepage"
        onClick={() => router.push('/')}
        isLoading={authFlow.isLoading}
      />
    );
  }
}
