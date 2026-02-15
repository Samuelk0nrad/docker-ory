import { UiText } from '@ory/client';

export type UiTextMessage = Omit<UiText, 'id'> & {
  id?: number;
  context?: Record<string, unknown>;
};