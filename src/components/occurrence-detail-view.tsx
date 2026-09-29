"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { addOccurrenceComment, advanceOccurrenceStatus, softDeleteOccurrence, updateOccurrence } from "@/app/_actions/occurrences";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { occurrenceCategories, occurrenceCategoryLabels, occurrenceStatusLabels, occurrenceStatuses, type OccurrenceCategory, type OccurrenceStatus } from "@/lib/occurrence-definitions";
import type { OccurrenceDetail } from "@/lib/data/occurrence-detail";

const editSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200),
  description: z.string().trim().min(1, "Informe a descrição.").max(10000),
  category: z.enum(["maintenance", "noise", "cleaning", "other"]),
  location: z.string().trim().min(1, "Informe o local.").max(200),
});

type EditValues = z.infer<typeof editSchema>;

type OccurrenceDetailViewProps = {
  occurrence: OccurrenceDetail;
  listPath: string;
};

const statusClasses: Record<OccurrenceStatus, string> = {
  pending: "border-transparent bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)]",
  in_review: "border-transparent bg-[var(--status-review-bg)] text-[var(--status-review-fg)]",
  resolved: "border-transparent bg-[var(--status-resolved-bg)] text-[var(--status-resolved-fg)]",
};

export function OccurrenceDetailView({ occurrence, listPath }: OccurrenceDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: occurrence.title,
      description: occurrence.description,
      category: occurrence.category,
      location: occurrence.location,
    },
  });

  function handleEdit(values: EditValues) {
    setFeedback(null);
    startTransition(() => {
      void updateOccurrence({ id: occurrence.id, ...values }).then((result) => {
        setIsError(!result.success);
        setFeedback(result.message ?? (result.success ? "Alterações salvas." : "Não foi possível salvar."));
        if (result.success) {
          setIsEditing(false);
          router.refresh();
        }
      });
    });
  }

  function handleAdvance() {
    setFeedback(null);
    startTransition(() => {
      void advanceOccurrenceStatus({ occurrenceId: occurrence.id, expectedStatus: occurrence.status }).then((result) => {
        setIsError(!result.success);
        setFeedback(result.message ?? (result.success ? "Status atualizado." : "Não foi possível atualizar o status."));
        if (result.success) router.refresh();
      });
    });
  }

  function handleDelete() {
    setFeedback(null);
    startTransition(() => {
      void softDeleteOccurrence({ id: occurrence.id }).then((result) => {
        if (!result.success) {
          setIsError(true);
          setFeedback(result.message ?? "Não foi possível excluir a ocorrência.");
          return;
        }
        router.replace(listPath);
        router.refresh();
      });
    });
  }

  function handleComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    setFeedback(null);
    startTransition(() => {
      void addOccurrenceComment({ occurrenceId: occurrence.id, body: comment }).then((result) => {
        setIsError(!result.success);
        setFeedback(result.message ?? (result.success ? "Comentário enviado." : "Não foi possível enviar o comentário."));
        if (result.success) {
          setComment("");
          router.refresh();
        }
      });
    });
  }

  const nextStatus = occurrence.status === "pending" ? "in_review" : "resolved";
  const authorLabel = occurrence.authorRole === "resident"
    ? `${occurrence.authorName}${occurrence.authorUnit ? ` · ${occurrence.authorUnit}` : ""}`
    : `${occurrence.authorName} · Administração`;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary" href={listPath}>
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para ocorrências
      </Link>

      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">#{occurrence.publicId}</span>
            <Badge className={statusClasses[occurrence.status]}>{occurrenceStatusLabels[occurrence.status]}</Badge>
          </div>
          {isEditing ? (
            <form className="mt-4 flex flex-col gap-5" onSubmit={form.handleSubmit(handleEdit)}>
              <FieldGroup>
                <Field data-invalid={Boolean(form.formState.errors.title)}>
                  <FieldLabel htmlFor="edit-title">Título</FieldLabel>
                  <Input id="edit-title" maxLength={200} aria-invalid={Boolean(form.formState.errors.title)} {...form.register("title")} />
                  <FieldError>{form.formState.errors.title?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.description)}>
                  <FieldLabel htmlFor="edit-description">Descrição</FieldLabel>
                  <Textarea id="edit-description" className="min-h-32 resize-y" maxLength={10000} aria-invalid={Boolean(form.formState.errors.description)} {...form.register("description")} />
                  <FieldError>{form.formState.errors.description?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.category)}>
                  <FieldLabel htmlFor="edit-category">Categoria</FieldLabel>
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="edit-category" aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {occurrenceCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{form.formState.errors.category?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.location)}>
                  <FieldLabel htmlFor="edit-location">Local</FieldLabel>
                  <Input id="edit-location" maxLength={200} aria-invalid={Boolean(form.formState.errors.location)} {...form.register("location")} />
                  <FieldError>{form.formState.errors.location?.message}</FieldError>
                </Field>
              </FieldGroup>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar alterações"}</Button>
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)} disabled={isPending}>Cancelar edição</Button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">{occurrence.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {occurrenceCategoryLabels[occurrence.category]} · {occurrence.location} · {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(occurrence.createdAt))}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Registrada por {authorLabel}</p>
            </>
          )}
        </div>
        {!isEditing && (occurrence.canEdit || occurrence.canAdvance) ? (
          <div className="flex flex-wrap gap-2">
            {occurrence.canEdit ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil data-icon="inline-start" />Editar
                </Button>
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                  <AlertDialogTrigger render={<Button variant="destructive" />}>
                    <Trash2 data-icon="inline-start" />Excluir
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir ocorrência?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A ocorrência #{occurrence.publicId} deixará de aparecer para todos. Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={(event) => {
                          event.preventDefault();
                          setIsDeleteOpen(false);
                          handleDelete();
                        }}
                      >
                        Excluir ocorrência
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : null}
            {occurrence.canAdvance ? (
              <Button onClick={handleAdvance} disabled={isPending}>
                <ArrowRight data-icon="inline-start" />
                Avançar para {occurrenceStatusLabels[nextStatus]}
              </Button>
            ) : null}
          </div>
        ) : null}
      </header>

      {feedback ? (
        <Alert variant={isError ? "destructive" : "default"} role="status">
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      {!isEditing ? (
        <>
          <Card>
            <CardHeader><CardTitle className="text-base">Descrição</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm leading-7">{occurrence.description}</p></CardContent>
          </Card>

          <section aria-labelledby="photos-heading" className="flex flex-col gap-3">
            <h2 id="photos-heading" className="font-heading text-lg font-semibold">Fotos</h2>
            {occurrence.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {occurrence.photos.map((photo) => (
                  <a key={photo.id} href={photo.signedUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border border-border bg-muted focus-visible:outline-2 focus-visible:outline-ring">
                    <img className="aspect-4/3 w-full object-cover" src={photo.signedUrl} alt={`Foto da ocorrência ${occurrence.publicId}`} />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-4" />
                Nenhuma foto anexada.
              </div>
            )}
          </section>

          <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 id="comments-heading" className="font-heading text-lg font-semibold">Comentários</h2>
              <span className="text-xs tabular-nums text-muted-foreground">{occurrence.comments.length}</span>
            </div>
            {occurrence.comments.length > 0 ? (
              <ol className="flex flex-col divide-y divide-border">
                {occurrence.comments.map((item) => (
                  <li key={item.id} className="py-4 first:pt-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium">{item.authorName}</span>
                      <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
                        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.body}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não há comentários nesta ocorrência.</p>
            )}
            {occurrence.canComment ? (
              <form className="flex flex-col gap-3" onSubmit={handleComment}>
                <label htmlFor="new-comment" className="text-sm font-medium">Adicionar comentário</label>
                <Textarea id="new-comment" className="min-h-24 resize-y" maxLength={5000} value={comment} onChange={(event) => setComment(event.currentTarget.value)} placeholder="Escreva uma atualização ou dúvida" />
                <Button className="self-end" type="submit" disabled={isPending || comment.trim().length === 0}>
                  {isPending ? "Enviando..." : "Enviar comentário"}
                </Button>
              </form>
            ) : null}
          </section>
        </>
      ) : null}
    </section>
  );
}