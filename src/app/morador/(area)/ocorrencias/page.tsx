import { OccurrenceList } from "@/components/occurrence-list";
import { getOccurrences } from "@/lib/data/occurrences";

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ResidentOccurrencesPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const { filters, result } = await getOccurrences(await searchParams, "resident");
  return (
    <OccurrenceList
      filters={filters}
      result={result}
      basePath="/morador/ocorrencias"
      createPath="/morador/ocorrencias/nova"
    />
  );
}