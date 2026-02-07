import { UiText } from '@ory/client';

export type UiTextMessage = Omit<UiText, 'id'> & {
  id?: number;
  context?: Record<string, unknown>;
};

const test: UiTextMessage = {
  text: 'This is a message',
  type: 'error',
};
