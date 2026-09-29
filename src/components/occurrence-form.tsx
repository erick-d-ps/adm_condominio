"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { occurrenceCategories } from "@/lib/occurrence-definitions";
import { createOccurrence } from "@/app/_actions/auth";

const formSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200),
  description: z.string().trim().min(1, "Informe a descrição.").max(10000),
  category: z.enum(["maintenance", "noise", "cleaning", "other"]),
  location: z.string().trim().min(1, "Informe o local.").max(200),
});

type FormValues = z.infer<typeof formSchema>;

const acceptedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const acceptedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const maxPhotoSize = 5 * 1024 * 1024;

function isAcceptedPhoto(file: File) {
  if (acceptedMimeTypes.has(file.type)) return true;
  const extension = file.name.split(".").pop()?.toLowerCase();
  return file.type === "" && extension !== undefined && acceptedExtensions.has(extension);
}

type OccurrenceFormProps = {
  listPath: string;
};

export function OccurrenceForm({ listPath }: OccurrenceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [photos, setPhotos] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadFailures, setUploadFailures] = useState<string[]>([]);
  const [isCreated, setIsCreated] = useState(false);
  const [createdPublicId, setCreatedPublicId] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", category: "maintenance", location: "" },
  });

  function handlePhotoChange(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length > 5) {
      setFormError("Anexe no máximo cinco fotos por ocorrência.");
      return;
    }
    if (selected.some((file) => !isAcceptedPhoto(file))) {
      setFormError("Use imagens JPG, JPEG, PNG, WebP ou GIF.");
      return;
    }
    if (selected.some((file) => file.size > maxPhotoSize)) {
      setFormError("Cada foto pode ter no máximo 5 MB.");
      return;
    }
    setFormError(null);
    setPhotos(selected);
  }

  function handleSubmit(values: FormValues) {
    setFormError(null);
    setUploadFailures([]);
    startTransition(async () => {
      const created = await createOccurrence(values);
      if (!created.success || !created.occurrenceId) {
        setFormError(created.message ?? "Não foi possível salvar a ocorrência.");
        return;
      }
      setCreatedPublicId(created.publicId ?? null);

      const failures: string[] = [];
      for (const photo of photos) {
        const uploadBody = new FormData();
        uploadBody.set("file", photo);
        const response = await fetch(`/api/ocorrencias/${created.occurrenceId}/fotos`, {
          method: "POST",
          body: uploadBody,
        });

        if (!response.ok) {
          failures.push(photo.name);
        }
      }

      if (failures.length > 0) {
        setIsCreated(true);
        setUploadFailures(failures);
        return;
      }

      router.push(`${listPath}?criada=${encodeURIComponent(created.publicId ?? "")}`);
      router.refresh();
    });
  }

  if (isCreated) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <AlertTitle>Ocorrência {createdPublicId ? `#${createdPublicId}` : "criada"}</AlertTitle>
          <AlertDescription>
            A ocorrência foi salva como pendente, mas estas fotos não puderam ser anexadas: {uploadFailures.join(", ")}.
          </AlertDescription>
        </Alert>
        <Button className="self-start" type="button" onClick={() => router.push(listPath)}>
          Voltar para ocorrências
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.title)}>
          <FieldLabel htmlFor="occurrence-title">Título</FieldLabel>
          <Input id="occurrence-title" maxLength={200} aria-invalid={Boolean(form.formState.errors.title)} {...form.register("title")} />
          <FieldError>{form.formState.errors.title?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.description)}>
          <FieldLabel htmlFor="occurrence-description">Descrição</FieldLabel>
          <Textarea
            id="occurrence-description"
            className="min-h-32 resize-y"
            maxLength={10000}
            aria-invalid={Boolean(form.formState.errors.description)}
            {...form.register("description")}
          />
          <FieldError>{form.formState.errors.description?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.category)}>
          <FieldLabel htmlFor="occurrence-category-form">Categoria</FieldLabel>
          <Select
            name="category"
            value={form.watch("category")}
            onValueChange={(value) => form.setValue("category", value as FormValues["category"], { shouldValidate: true })}
          >
            <SelectTrigger id="occurrence-category-form" aria-invalid={Boolean(form.formState.errors.category)}>
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
          <FieldError>{form.formState.errors.category?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.location)}>
          <FieldLabel htmlFor="occurrence-location">Local</FieldLabel>
          <Input id="occurrence-location" maxLength={200} placeholder="Ex.: garagem, bloco A, apartamento 101" aria-invalid={Boolean(form.formState.errors.location)} {...form.register("location")} />
          <FieldError>{form.formState.errors.location?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="occurrence-photos">Fotos (opcional)</FieldLabel>
          <Input
            id="occurrence-photos"
            type="file"
            accept=".jpg,.jpeg,image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={(event) => handlePhotoChange(event.currentTarget.files)}
          />
          <FieldDescription>
            Até 5 imagens, 5 MB cada. {photos.length > 0 ? `${photos.length} selecionada(s).` : ""}
          </FieldDescription>
        </Field>
      </FieldGroup>
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push(listPath)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Registrar ocorrência"}
        </Button>
      </div>
    </form>
  );
}