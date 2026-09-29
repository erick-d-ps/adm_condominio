"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateResident } from "@/app/_actions/residents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ResidentListItem } from "@/lib/data/residents";

const formSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo.").max(160),
  email: z.email("Informe um e-mail válido."),
  tower: z.string().trim().min(1, "Informe a torre.").max(40),
  apartment: z.string().trim().min(1, "Informe o apartamento.").max(40),
  phone: z.string().trim().min(1, "Informe o telefone.").max(40),
});

type FormValues = z.infer<typeof formSchema>;

type ResidentEditFormProps = {
  resident: ResidentListItem;
  onCancel: () => void;
};

export function ResidentEditForm({ resident, onCancel }: ResidentEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resident.name,
      email: resident.email,
      tower: resident.tower,
      apartment: resident.apartment,
      phone: resident.phone,
    },
  });

  function handleSubmit(values: FormValues) {
    startTransition(() => {
      void updateResident({ residentId: resident.id, ...values }).then((result) => {
        if (!result.success) {
          form.setError("root", { message: result.message ?? "Não foi possível atualizar." });
          return;
        }
        router.refresh();
        onCancel();
      });
    });
  }

  return (
    <section aria-labelledby={`edit-resident-${resident.id}`} className="border-y border-border bg-muted/40 px-4 py-5">
      <div className="mb-4">
        <h2 id={`edit-resident-${resident.id}`} className="font-heading text-base font-semibold">
          Editar {resident.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se alterar o e-mail, o morador usará o novo endereço e a senha atual para entrar.
        </p>
      </div>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(form.formState.errors.name)}>
            <FieldLabel htmlFor="edit-resident-name">Nome completo</FieldLabel>
            <Input id="edit-resident-name" autoComplete="name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
            <FieldError>{form.formState.errors.name?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.email)}>
            <FieldLabel htmlFor="edit-resident-email">E-mail</FieldLabel>
            <Input id="edit-resident-email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.tower)}>
            <FieldLabel htmlFor="edit-resident-tower">Torre</FieldLabel>
            <Input id="edit-resident-tower" aria-invalid={Boolean(form.formState.errors.tower)} {...form.register("tower")} />
            <FieldError>{form.formState.errors.tower?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.apartment)}>
            <FieldLabel htmlFor="edit-resident-apartment">Apartamento</FieldLabel>
            <Input id="edit-resident-apartment" aria-invalid={Boolean(form.formState.errors.apartment)} {...form.register("apartment")} />
            <FieldError>{form.formState.errors.apartment?.message}</FieldError>
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.phone)}>
            <FieldLabel htmlFor="edit-resident-phone">Telefone</FieldLabel>
            <Input id="edit-resident-phone" type="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.phone)} {...form.register("phone")} />
            <FieldError>{form.formState.errors.phone?.message}</FieldError>
          </Field>
        </FieldGroup>
        {form.formState.errors.root?.message ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar alterações"}</Button>
          <Button variant="outline" type="button" onClick={onCancel} disabled={isPending}>Cancelar</Button>
        </div>
      </form>
    </section>
  );
}