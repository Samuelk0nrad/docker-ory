import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Field, FieldGroup } from './ui/field';
import { Spinner } from './ui/spinner';

export function OneButtonForm({
  title,
  description,
  buttonText,
  onClick,
  isLoading,
}: {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className={'flex flex-col gap-6'}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Button type="button" onClick={onClick} disabled={isLoading}>
                {isLoading ? <Spinner /> : buttonText}
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
