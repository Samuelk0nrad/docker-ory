'use client';

import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { Label } from './label';

function Message({
  message,
  content,
}: {
  message?: UiTextMessage;
  content?: React.ReactNode;
}) {
  if (message === undefined) {
    return content ?? null;
  }
  return (
    <Label
      data-slot="label"
      className={message.type === 'error' ? 'text-red-500' : ''}
    >
      {message.text}
    </Label>
  );
}

export { Message };
