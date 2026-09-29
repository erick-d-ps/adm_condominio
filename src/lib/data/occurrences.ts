import "server-only";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import {
  occurrenceCategories,
  occurrenceStatuses,
  type OccurrenceCategory,
  type OccurrenceStatus,
} from "@/lib/occurrence-definitions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const pageSize = 20;

export type OccurrenceFilters = {
  query: string;
  status: OccurrenceStatus | "all";
  category: OccurrenceCategory | "all";
  page: number;
};

export type OccurrenceListItem = {
  id: number;
  public_id: string;
  title: string;
  category: OccurrenceCategory;
  location: string;
  status: OccurrenceStatus;
  created_at: string;
};

export type OccurrenceListResult = {
  state: "ready" | "unavailable";
  occurrences: OccurrenceListItem[];
  totalCount: number;
  page: number;
  pageCount: number;
};

function normalizeFilters(input: Partial<Record<string, string | string[] | undefined>>): OccurrenceFilters {
  const queryValue = Array.isArray(input.q) ? input.q[0] : input.q;
  const statusValue = Array.isArray(input.status) ? input.status[0] : input.status;
  const categoryValue = Array.isArray(input.category) ? input.category[0] : input.category;
  const pageValue = Array.isArray(input.page) ? input.page[0] : input.page;
  const query = (queryValue ?? "")
    .trim()
    .replace(/[^\p{L}\p{N}\s#-]/gu, "")
    .slice(0, 80);
  const status = occurrenceStatuses.some((option) => option.value === statusValue)
    ? (statusValue as OccurrenceStatus)
    : "all";
  const category = occurrenceCategories.some((option) => option.value === categoryValue)
    ? (categoryValue as OccurrenceCategory)
    : "all";
  const requestedPage = Number.parseInt(pageValue ?? "1", 10);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;

  return { query, status, category, page };
}

export async function getOccurrences(
  input: Partial<Record<string, string | string[] | undefined>>,
  expectedRole: "employee" | "resident"
): Promise<{ filters: OccurrenceFilters; result: OccurrenceListResult }> {
  const filters = normalizeFilters(input);
  const emptyResult: OccurrenceListResult = {
    state: "unavailable",
    occurrences: [],
    totalCount: 0,
    page: filters.page,
    pageCount: 0,
  };
  const user = await getCurrentAppUser();

  if (!user || user.role !== expectedRole) {
    return { filters, result: emptyResult };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { filters, result: emptyResult };
  const client = supabase;

  function buildQuery() {
    let query = client
      .from("occurrences")
      .select("id, public_id, title, category, location, status, created_at", { count: "exact" })
      .is("deleted_at", null);

    if (filters.status !== "all") query = query.eq("status", filters.status);
    if (filters.category !== "all") query = query.eq("category", filters.category);

    if (filters.query) {
      const pattern = `%${filters.query}%`;
      query = query.or(
        ["public_id", "title", "description", "location"]
          .map((column) => `${column}.ilike.${pattern}`)
          .join(",")
      );
    }

    return query;
  }

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await buildQuery()
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) return { filters, result: emptyResult };

  const totalCount = count ?? 0;
  const pageCount = Math.ceil(totalCount / pageSize);
  const page = pageCount > 0 ? Math.min(filters.page, pageCount) : 1;
  const pageData = page !== filters.page
    ? await buildQuery()
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)
    : { data, error };

  if (pageData.error) return { filters, result: emptyResult };

  return {
    filters: { ...filters, page },
    result: {
      state: "ready",
      occurrences: (pageData.data ?? []) as OccurrenceListItem[],
      totalCount,
      page,
      pageCount,
    },
  };
}