export const occurrenceCategories = [
  { value: "maintenance", label: "Manutenção" },
  { value: "noise", label: "Ruído" },
  { value: "cleaning", label: "Limpeza" },
  { value: "other", label: "Outros" },
] as const;

export const occurrenceStatuses = [
  { value: "pending", label: "Pendente" },
  { value: "in_review", label: "Em análise" },
  { value: "resolved", label: "Resolvido" },
] as const;

export type OccurrenceCategory = (typeof occurrenceCategories)[number]["value"];
export type OccurrenceStatus = (typeof occurrenceStatuses)[number]["value"];

export const occurrenceCategoryLabels: Record<OccurrenceCategory, string> = {
  maintenance: "Manutenção",
  noise: "Ruído",
  cleaning: "Limpeza",
  other: "Outros",
};

export const occurrenceStatusLabels: Record<OccurrenceStatus, string> = {
  pending: "Pendente",
  in_review: "Em análise",
  resolved: "Resolvido",
};