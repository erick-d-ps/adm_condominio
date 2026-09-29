import { render, screen } from "@testing-library/react";
import { OccurrenceList } from "@/components/occurrence-list";
import type { OccurrenceListResult } from "@/lib/data/occurrences";

const baseFilters = {
  query: "",
  status: "all" as const,
  category: "all" as const,
  page: 1,
};

describe("OccurrenceList", () => {
  it("shows the occurrence and links its title to the detail", () => {
    const result: OccurrenceListResult = {
      state: "ready",
      totalCount: 1,
      page: 1,
      pageCount: 1,
      occurrences: [
        {
          id: 1,
          public_id: "OC-1234ABCD",
          title: "Vazamento no corredor",
          category: "maintenance",
          location: "Bloco A",
          status: "pending",
          created_at: "2026-09-28T12:00:00.000Z",
        },
      ],
    };

    render(
      <OccurrenceList
        filters={baseFilters}
        result={result}
        basePath="/morador/ocorrencias"
        createPath="/morador/ocorrencias/nova"
      />
    );

    expect(screen.getByRole("link", { name: "Vazamento no corredor" })).toHaveAttribute(
      "href",
      "/morador/ocorrencias/OC-1234ABCD"
    );
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.getByText("Bloco A")).toBeInTheDocument();
  });

  it("shows a useful empty state when no records match", () => {
    const result: OccurrenceListResult = {
      state: "ready",
      totalCount: 0,
      page: 1,
      pageCount: 0,
      occurrences: [],
    };

    render(
      <OccurrenceList
        filters={baseFilters}
        result={result}
        basePath="/funcionario/ocorrencias"
        createPath="/funcionario/ocorrencias/nova"
      />
    );

    expect(screen.getByText("Nenhuma ocorrência encontrada")).toBeInTheDocument();
  });
});