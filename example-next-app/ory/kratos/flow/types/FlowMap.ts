import {
  RegistrationFlow,
  LoginFlow,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/client';
import { FlowTypeEnum } from './FlowTypes';

export type FlowMap = {
  [FlowTypeEnum.Registration]: RegistrationFlow;
  [FlowTypeEnum.Login]: LoginFlow;
  [FlowTypeEnum.Recovery]: RecoveryFlow;
  [FlowTypeEnum.Settings]: SettingsFlow;
  [FlowTypeEnum.Verification]: VerificationFlow;
};
