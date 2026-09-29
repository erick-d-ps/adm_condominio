import { OccurrenceForm } from "@/components/occurrence-form";

export default function NewResidentOccurrencePage() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Nova ocorrência</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conte o que aconteceu no condomínio.
        </p>
      </header>
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <OccurrenceForm listPath="/morador/ocorrencias" />
      </div>
    </section>
  );
}