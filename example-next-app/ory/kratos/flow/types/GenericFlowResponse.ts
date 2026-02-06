import { ContinueWith, GenericError, UiContainer } from '@ory/client';

// Unified response type for various Kratos responses (Login, Registration, etc. + Errors)
export interface GenericFlowResponse {
  continue_with?: ContinueWith[];
  redirect_browser_to?: string;
  error?: GenericError;
  ui?: UiContainer;
}
