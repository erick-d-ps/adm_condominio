"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createResident, setResidentActive } from "@/app/_actions/residents";
import { ResidentEditForm } from "@/components/resident-edit-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ResidentListItem } from "@/lib/data/residents";

const residentFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo.").max(160),
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(12, "Use uma senha com pelo menos 12 caracteres."),
  tower: z.string().trim().min(1, "Informe a torre.").max(40),
  apartment: z.string().trim().min(1, "Informe o apartamento.").max(40),
  phone: z.string().trim().min(1, "Informe o telefone.").max(40),
});

type ResidentFormValues = z.infer<typeof residentFormSchema>;

type ResidentManagerProps = {
  residents: ResidentListItem[];
  isUnavailable: boolean;
};

export function ResidentManager({ residents, isUnavailable }: ResidentManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentListItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: { name: "", email: "", password: "", tower: "", apartment: "", phone: "" },
  });

  function handleCreate(values: ResidentFormValues) {
    setFeedback(null);
    startTransition(() => {
      void createResident(values).then((result) => {
        setIsError(!result.success);
        setFeedback(result.message ?? null);
        if (result.success) {
          form.reset();
          setIsCreating(false);
          router.refresh();
        }
      });
    });
  }

  function handleStatusChange(resident: ResidentListItem) {
    setFeedback(null);
    startTransition(() => {
      void setResidentActive({ residentId: resident.id, isActive: !resident.isActive }).then((result) => {
        setIsError(!result.success);
        setFeedback(result.message ?? null);
        if (result.success) router.refresh();
      });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <header>
          <h1 className="font-heading text-2xl font-semibold">Cadastro de Moradores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o acesso e os dados dos moradores cadastrados.
          </p>
        </header>
        <Button variant={isCreating ? "outline" : "default"} onClick={() => setIsCreating((current) => !current)}>
          {isCreating ? "Cancelar cadastro" : "Cadastrar morador"}
        </Button>
      </div>

      {feedback ? (
        <Alert variant={isError ? "destructive" : "default"} role="status">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      {isCreating ? (
        <section aria-labelledby="new-resident-heading" className="border-y border-border py-5">
          <div className="mb-5">
            <h2 id="new-resident-heading" className="font-heading text-lg font-semibold">Novo morador</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Defina a senha de acesso e compartilhe-a com o morador por um canal seguro.
            </p>
          </div>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleCreate)}>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(form.formState.errors.name)}>
                <FieldLabel htmlFor="resident-name">Nome completo</FieldLabel>
                <Input id="resident-name" autoComplete="name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.email)}>
                <FieldLabel htmlFor="resident-email-form">E-mail</FieldLabel>
                <Input id="resident-email-form" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} />
                <FieldError>{form.formState.errors.email?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.password)}>
                <FieldLabel htmlFor="resident-password">Senha inicial</FieldLabel>
                <Input id="resident-password" type="password" autoComplete="new-password" minLength={12} aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} />
                <FieldDescription>Mínimo de 12 caracteres. A equipe que definiu a senha poderá conhecê-la.</FieldDescription>
                <FieldError>{form.formState.errors.password?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.tower)}>
                <FieldLabel htmlFor="resident-tower">Torre</FieldLabel>
                <Input id="resident-tower" aria-invalid={Boolean(form.formState.errors.tower)} {...form.register("tower")} />
                <FieldError>{form.formState.errors.tower?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.apartment)}>
                <FieldLabel htmlFor="resident-apartment">Apartamento</FieldLabel>
                <Input id="resident-apartment" aria-invalid={Boolean(form.formState.errors.apartment)} {...form.register("apartment")} />
                <FieldError>{form.formState.errors.apartment?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.phone)}>
                <FieldLabel htmlFor="resident-phone">Telefone</FieldLabel>
                <Input id="resident-phone" type="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.phone)} {...form.register("phone")} />
                <FieldError>{form.formState.errors.phone?.message}</FieldError>
              </Field>
            </FieldGroup>
            <Button className="self-start" type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar morador"}
            </Button>
          </form>
        </section>
      ) : null}

      {isUnavailable ? (
        <Alert variant="destructive">
          <AlertDescription>Não foi possível carregar os moradores. Verifique a configuração do Supabase.</AlertDescription>
        </Alert>
      ) : residents.length === 0 ? (
        <Empty className="border-y border-border py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon"><span className="text-lg font-semibold">A</span></EmptyMedia>
            <EmptyTitle>Nenhum morador cadastrado</EmptyTitle>
            <EmptyDescription>Cadastre os moradores que terão acesso ao sistema.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Morador</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell>
                      <span className="block font-medium">{resident.name}</span>
                      <span className="text-xs text-muted-foreground">{resident.email}</span>
                    </TableCell>
                    <TableCell>{resident.tower} · {resident.apartment}</TableCell>
                    <TableCell>{resident.phone}</TableCell>
                    <TableCell>
                      <Badge className={resident.isActive ? "border-transparent bg-(--status-resolved-bg) text-(--status-resolved-fg)" : "border-transparent bg-secondary text-secondary-foreground"}>
                        {resident.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => setEditingResident((current) => current?.id === resident.id ? null : resident)}
                        >
                          {editingResident?.id === resident.id ? "Fechar" : "Editar"}
                        </Button>
                        <Button variant="outline" size="sm" disabled={isPending} onClick={() => handleStatusChange(resident)}>
                          {resident.isActive ? "Inativar" : "Reativar"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {editingResident ? (
            <ResidentEditForm key={editingResident.id} resident={editingResident} onCancel={() => setEditingResident(null)} />
          ) : null}
        </div>
      )}
    </div>
  );
}