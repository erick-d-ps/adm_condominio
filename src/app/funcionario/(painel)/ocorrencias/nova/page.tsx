import { OccurrenceForm } from "@/components/occurrence-form";

export default function NewEmployeeOccurrencePage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Nova ocorrência</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre o problema para acompanhamento do condomínio.
        </p>
      </header>
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <OccurrenceForm listPath="/funcionario/ocorrencias" />
      </div>
    </section>
  );
}