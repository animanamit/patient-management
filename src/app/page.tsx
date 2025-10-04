import {
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <FieldSet>
        <FieldLegend>Profile</FieldLegend>
        <FieldDescription>
          This appears on invoices and emails.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
            <FieldDescription>
              This appears on invoices and emails.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" autoComplete="off" aria-invalid />
            <FieldError>Choose another username.</FieldError>
          </Field>
          <Field orientation="horizontal">
            <Switch id="newsletter" />
            <FieldLabel htmlFor="newsletter">
              Subscribe to the newsletter
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
