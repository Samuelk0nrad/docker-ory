'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { UiTextMessage } from '@/ory/kratos/flow/types/UiTextMessage';
import { Message } from '../../../components/ui/message';
import { Spinner } from '../../../components/ui/spinner';

interface FlowFormProps {
  /** The title displayed in the card header */
  title: string;
  /** The description displayed below the title */
  description: string;
  /** Form submission handler */
  submitForm: (e?: React.SubmitEvent<HTMLFormElement>) => void;

  /** Validation and status messages for the form */
  messagesEmail?: UiTextMessage;
  messagesGeneral?: UiTextMessage;

  /** The text displayed on the submit button */
  buttonText: string;

  /** Whether the form is in a loading state */
  isLoading: boolean;

  children?: React.ReactNode;

  bottomContent?: React.ReactNode;
}

export function FlowForm({
  title,
  description,
  submitForm,
  messagesGeneral,
  buttonText,
  isLoading,
  children,
  bottomContent,
}: FlowFormProps) {
  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitForm}>
            {children}
            <FieldGroup className={`mt-6`}>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : buttonText}
                </Button>
                <Message message={messagesGeneral} />
                {bottomContent}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
