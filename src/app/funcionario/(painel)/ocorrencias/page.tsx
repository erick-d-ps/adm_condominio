import { OccurrenceList } from "@/components/occurrence-list";
import { getOccurrences } from "@/lib/data/occurrences";

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function EmployeeOccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const { filters, result } = await getOccurrences(await searchParams, "employee");
  return (
    <OccurrenceList
      filters={filters}
      result={result}
      basePath="/funcionario/ocorrencias"
      createPath="/funcionario/ocorrencias/nova"
    />
  );
}