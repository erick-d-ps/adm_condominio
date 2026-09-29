"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInResident } from "@/app/_actions/auth";

const formSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type FormValues = z.infer<typeof formSchema>;

export function ResidentAccessForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleLogin(values: FormValues) {
    setMessage(null);
    startTransition(() => {
      void signInResident(values).then((result) => {
        setMessage(result.message ?? null);
        setIsError(!result.success);
        if (result.success) window.location.assign("/morador/ocorrencias");
      });
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleLogin)}>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="resident-email">E-mail cadastrado</FieldLabel>
          <Input
            id="resident-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com.br"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="resident-password">Senha</FieldLabel>
          <Input
            id="resident-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>
      {message ? (
        <Alert variant={isError ? "destructive" : "default"} role="status">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="h-11 w-full" type="submit" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}