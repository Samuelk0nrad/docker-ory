import {
  SuccessfulNativeRegistration,
  SuccessfulNativeLogin,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/client';
import { FlowTypeEnum } from './FlowTypes';

export type UpdateFlowResponseMap = {
  [FlowTypeEnum.Registration]: SuccessfulNativeRegistration;
  [FlowTypeEnum.Login]: SuccessfulNativeLogin;
  [FlowTypeEnum.Recovery]: RecoveryFlow;
  [FlowTypeEnum.Settings]: SettingsFlow;
  [FlowTypeEnum.Verification]: VerificationFlow;
};
