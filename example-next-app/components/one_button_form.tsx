'use client';

import { FlowForm } from '../ory/kratos/ui/flow_form';

interface OneButtonFormProps {
  /** The title displayed in the card header */
  title: string;
  /** The description displayed below the title */
  description: string;
  /** Button click handler */
  onClick: () => void;

  /** The text displayed on the button */
  buttonText: string;

  /** Whether the form is in a loading state */
  isLoading: boolean;
}

export function OneButtonForm({
  title,
  description,
  buttonText,
  onClick,
  isLoading,
}: OneButtonFormProps) {
  return (
    <FlowForm
      title={title}
      description={description}
      submitForm={(e) => {
        e?.preventDefault();
        onClick();
      }}
      buttonText={buttonText}
      isLoading={isLoading}
    />
  );
}
