'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Message } from '@/components/ui/message';
import { UiTextMessage } from '../../flow/types/UiTextMessage';

interface EmailInputProps {
  value: string;
  setValue: (value: string) => void;
  message: UiTextMessage | undefined;
}

export function EmailInput({ value, setValue, message }: EmailInputProps) {
  return (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        type="email"
        placeholder="max@mustermann.com"
        required
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <Message message={message} />
    </Field>
  );
}
