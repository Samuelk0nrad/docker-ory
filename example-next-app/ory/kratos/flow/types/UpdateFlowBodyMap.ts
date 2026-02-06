import {
  UpdateRegistrationFlowBody,
  UpdateLoginFlowBody,
  UpdateRecoveryFlowBody,
  UpdateSettingsFlowBody,
  UpdateVerificationFlowBody,
} from '@ory/client';
import { FlowTypeEnum } from './FlowTypes';

// Map flow types to their update body types
export type UpdateFlowBodyMap = {
  [FlowTypeEnum.Registration]: UpdateRegistrationFlowBody;
  [FlowTypeEnum.Login]: UpdateLoginFlowBody;
  [FlowTypeEnum.Recovery]: UpdateRecoveryFlowBody;
  [FlowTypeEnum.Settings]: UpdateSettingsFlowBody;
  [FlowTypeEnum.Verification]: UpdateVerificationFlowBody;
};
