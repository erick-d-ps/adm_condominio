"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInEmployee } from "@/app/_actions/auth";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleSubmit(values: LoginValues) {
    setServerError(null);
    startTransition(() => {
      void signInEmployee(values).then((result) => {
        if (!result.success) {
          setServerError(result.message ?? "Não foi possível entrar.");
          return;
        }
        router.replace("/funcionario/ocorrencias");
        router.refresh();
      });
    });
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.email)}>
          <FieldLabel htmlFor="employee-email">E-mail</FieldLabel>
          <Input
            id="employee-email"
            type="email"
            autoComplete="username"
            placeholder="nome@condominio.com.br"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="employee-password">Senha</FieldLabel>
          <Input
            id="employee-password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <FieldError>{form.formState.errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>
      {serverError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="h-11 w-full" type="submit" disabled={isPending}>
        {isPending ? "Verificando..." : "Entrar na administração"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        É morador?{" "}
        <Link className={buttonVariants({ variant: "link", size: "sm" })} href="/morador/acesso">
          Acessar com e-mail
        </Link>
      </p>
    </form>
  );
}