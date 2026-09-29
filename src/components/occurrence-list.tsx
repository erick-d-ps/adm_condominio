import Link from "next/link";
import { ClipboardList, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  occurrenceCategories,
  occurrenceCategoryLabels,
  occurrenceStatusLabels,
  occurrenceStatuses,
  type OccurrenceStatus,
} from "@/lib/occurrence-definitions";
import type { OccurrenceFilters, OccurrenceListResult } from "@/lib/data/occurrences";

type OccurrenceListProps = {
  filters: OccurrenceFilters;
  result: OccurrenceListResult;
  basePath: string;
  createPath: string;
};

function buildPageHref(basePath: string, filters: OccurrenceFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.category !== "all") params.set("category", filters.category);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

function StatusBadge({ status }: { status: OccurrenceStatus }) {
  const classes = {
    pending: "border-transparent bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)]",
    in_review: "border-transparent bg-[var(--status-review-bg)] text-[var(--status-review-fg)]",
    resolved: "border-transparent bg-[var(--status-resolved-bg)] text-[var(--status-resolved-fg)]",
  };

  return <Badge className={classes[status]}>{occurrenceStatusLabels[status]}</Badge>;
}

export function OccurrenceList({ filters, result, basePath, createPath }: OccurrenceListProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Ocorrências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registros do Residencial Aurora, mais recentes primeiro.
          </p>
        </div>
        <Link className={buttonVariants({ className: "h-11" })} href={createPath}>
          <ClipboardList data-icon="inline-start" />
          Nova ocorrência
        </Link>
      </header>

      <form className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[minmax(220px,1fr)_190px_190px_auto_auto] md:items-end" method="get">
        <Field>
          <FieldLabel htmlFor="occurrence-search">Buscar</FieldLabel>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="occurrence-search"
              name="q"
              className="pl-9"
              defaultValue={filters.query}
              placeholder="ID, local ou descrição"
            />
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="occurrence-status">Status</FieldLabel>
          <Select name="status" defaultValue={filters.status}>
            <SelectTrigger id="occurrence-status">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos os status</SelectItem>
                {occurrenceStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="occurrence-category">Categoria</FieldLabel>
          <Select name="category" defaultValue={filters.category}>
            <SelectTrigger id="occurrence-category">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {occurrenceCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Button className="h-9" type="submit">Filtrar</Button>
        <Link className={buttonVariants({ variant: "ghost", className: "h-9" })} href={basePath}>Limpar</Link>
      </form>

      {result.state === "unavailable" ? (
        <Alert variant="destructive">
          <AlertDescription>
            Não foi possível carregar as ocorrências. Verifique a conexão com o Supabase.
          </AlertDescription>
        </Alert>
      ) : result.occurrences.length === 0 ? (
        <Empty className="rounded-lg border border-border bg-card py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ClipboardList aria-hidden="true" /></EmptyMedia>
            <EmptyTitle>Nenhuma ocorrência encontrada</EmptyTitle>
            <EmptyDescription>
              Ajuste os filtros ou registre uma nova ocorrência.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Identificador</TableHead>
                  <TableHead>Ocorrência</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="w-36">Criada em</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.occurrences.map((occurrence) => (
                  <TableRow key={occurrence.id}>
                    <TableCell className="font-medium tabular-nums">#{occurrence.public_id}</TableCell>
                    <TableCell>
                      <Link
                        className="block font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        href={`${basePath}/${occurrence.public_id}`}
                      >
                        {occurrence.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">{occurrenceCategoryLabels[occurrence.category]}</span>
                    </TableCell>
                    <TableCell>{occurrence.location}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(occurrence.created_at))}
                    </TableCell>
                    <TableCell><StatusBadge status={occurrence.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <footer className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {result.totalCount} {result.totalCount === 1 ? "ocorrência" : "ocorrências"}
            </p>
            <nav aria-label="Paginação das ocorrências" className="flex items-center gap-2">
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "icon-sm",
                  className: result.page <= 1 ? "pointer-events-none opacity-50" : undefined,
                })}
                aria-label="Página anterior"
                aria-disabled={result.page <= 1}
                tabIndex={result.page <= 1 ? -1 : undefined}
                href={buildPageHref(basePath, filters, Math.max(1, result.page - 1))}
              >
                <ChevronLeft />
              </Link>
              <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
                {result.page} / {Math.max(1, result.pageCount)}
              </span>
              <Link
                className={buttonVariants({
                  variant: "outline",
                  size: "icon-sm",
                  className: result.page >= result.pageCount ? "pointer-events-none opacity-50" : undefined,
                })}
                aria-label="Próxima página"
                aria-disabled={result.page >= result.pageCount}
                tabIndex={result.page >= result.pageCount ? -1 : undefined}
                href={buildPageHref(basePath, filters, Math.min(result.pageCount, result.page + 1))}
              >
                <ChevronRight />
              </Link>
            </nav>
          </footer>
        </div>
      )}
    </section>
  );
}