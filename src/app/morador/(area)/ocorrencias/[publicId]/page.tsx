import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OccurrenceDetailView } from "@/components/occurrence-detail-view";
import { getOccurrenceDetail } from "@/lib/data/occurrence-detail";

export default async function ResidentOccurrenceDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await getOccurrenceDetail(publicId);

  if (result.state === "not-found") notFound();
  if (result.state === "unavailable") {
    return <Alert variant="destructive"><AlertDescription>Não foi possível carregar a ocorrência.</AlertDescription></Alert>;
  }

  return <OccurrenceDetailView occurrence={result.occurrence} listPath="/morador/ocorrencias" />;
}