'use client';

import { useAuthFlow } from '@/ory/kratos/flow_hook';
import { SelfServiceFlow } from '@/ory/kratos/flow/SelfServiceFlow';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OTPForm } from '@/components/otp_form';

import { UpdateVerificationFlowWithCodeMethod } from '@ory/client';

export function VerificationPanel({ flowId }: { flowId?: string }) {
  const router = useRouter();
  const authFlow = useAuthFlow(SelfServiceFlow.Verification, flowId);

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    authFlow.updateFlow();
  };

  useEffect(() => {
    authFlow.setMethod('code');
  }, [flowId]);

  useEffect(() => {
    if (authFlow.flow.flow?.state === 'passed_challenge') {
      router.push('/');
    }
  }, [authFlow.flow.flow?.state]);

  const flowData =
    authFlow.data as Partial<UpdateVerificationFlowWithCodeMethod>;

  return (
    <OTPForm
      title="Enter verification code"
      description="We sent a 6-digit code to your email."
      submitForm={submitForm}
      code={flowData.code || ''}
      setCode={(value) => authFlow.setData('code', value)}
      messages={authFlow.messages}
      isLoading={authFlow.isLoading}
    />
  );
}
