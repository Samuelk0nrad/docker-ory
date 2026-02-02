import {
  RegistrationFlow,
  LoginFlow,
  RecoveryFlow,
  SettingsFlow,
  VerificationFlow,
} from '@ory/client';

// Union type of all possible flow types
export type AnyFlow =
  | RegistrationFlow
  | LoginFlow
  | RecoveryFlow
  | SettingsFlow
  | VerificationFlow;
