import { ResidentManager } from "@/components/resident-manager";
import { getResidents } from "@/lib/data/residents";

export default async function ResidentsPage() {
  const result = await getResidents();
  return (
    <ResidentManager
      residents={result.state === "ready" ? result.residents : []}
      isUnavailable={result.state === "unavailable"}
    />
  );
}