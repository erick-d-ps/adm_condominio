import "server-only";

import { getCurrentAppUser } from "@/lib/auth/current-user";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatCommentAuthorLabel,
  formatOccurrenceAuthorLabel,
  type OccurrenceCategory,
  type OccurrenceStatus,
} from "@/lib/occurrence-definitions";

export type OccurrenceDetail = {
  id: number;
  publicId: string;
  title: string;
  description: string;
  category: OccurrenceCategory;
  location: string;
  status: OccurrenceStatus;
  authorId: string;
  authorName: string;
  authorRole: "employee" | "resident";
  authorLabel: string;
  createdAt: string;
  photos: Array<{ id: number; signedUrl: string }>;
  comments: Array<{
    id: number;
    body: string;
    createdAt: string;
    authorName: string;
    canDelete: boolean;
  }>;
  viewerRole: "employee" | "resident";
  canEdit: boolean;
  canComment: boolean;
  canAdvance: boolean;
};

export type OccurrenceDetailResult =
  | { state: "ready"; occurrence: OccurrenceDetail }
  | { state: "not-found" }
  | { state: "unavailable" };

type ProfileRow = {
  id: string;
  display_name: string;
  role: "employee" | "resident";
};
type CommenterRow = {
  id: string;
  display_name: string;
  role: "employee" | "resident";
};
type PhotoRow = { id: number; storage_path: string };
type CommentRow = {
  id: number;
  body: string;
  created_at: string;
  author_profile_id: string;
};

export async function getOccurrenceDetail(
  publicId: string
): Promise<OccurrenceDetailResult> {
  const user = await getCurrentAppUser();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!user || !supabase || !admin) return { state: "unavailable" };

  const { data: row, error } = await supabase
    .from("occurrences")
    .select(
      "id, public_id, title, description, category, location, status, author_profile_id, created_at"
    )
    .eq("public_id", publicId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { state: "unavailable" };
  if (!row) return { state: "not-found" };

  const [{ data: author }, { data: photoRows }, { data: commentRows }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, display_name, role")
        .eq("id", row.author_profile_id)
        .maybeSingle(),
      supabase
        .from("occurrence_photos")
        .select("id, storage_path")
        .eq("occurrence_id", row.id),
      supabase
        .from("occurrence_comments")
        .select("id, body, created_at, author_profile_id")
        .eq("occurrence_id", row.id)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }),
    ]);

  if (!author) return { state: "unavailable" };

  const typedAuthor = author as ProfileRow;
  const typedPhotos = (photoRows ?? []) as PhotoRow[];
  const typedComments = (commentRows ?? []) as CommentRow[];
  const commenterIds = [
    ...new Set(typedComments.map((comment) => comment.author_profile_id)),
  ];
  const { data: commenters } =
    commenterIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, display_name, role")
          .in("id", commenterIds)
      : { data: [] as CommenterRow[] };
  const commenterProfiles = new Map(
    ((commenters ?? []) as CommenterRow[]).map((commenter) => [
      commenter.id,
      commenter,
    ])
  );
  const photos = await Promise.all(
    typedPhotos.map(async (photo) => {
      const { data } = await admin.storage
        .from("occurrence-photos")
        .createSignedUrl(photo.storage_path, 300);
      return data?.signedUrl
        ? { id: photo.id, signedUrl: data.signedUrl }
        : null;
    })
  );

  const status = row.status as OccurrenceStatus;
  const authorRole = typedAuthor.role;

  return {
    state: "ready",
    occurrence: {
      id: row.id,
      publicId: row.public_id,
      title: row.title,
      description: row.description,
      category: row.category as OccurrenceCategory,
      location: row.location,
      status,
      authorId: row.author_profile_id,
      authorName: typedAuthor.display_name,
      authorRole,
      authorLabel: formatOccurrenceAuthorLabel(
        authorRole,
        typedAuthor.display_name
      ),
      createdAt: row.created_at,
      photos: photos.filter(
        (photo): photo is { id: number; signedUrl: string } => photo !== null
      ),
      comments: typedComments.map((comment) => {
        const commenter = commenterProfiles.get(comment.author_profile_id);
        return {
          id: comment.id,
          body: comment.body,
          createdAt: comment.created_at,
          authorName: formatCommentAuthorLabel(
            commenter?.role ?? null,
            commenter?.display_name ?? null
          ),
          canDelete: comment.author_profile_id === user.id,
        };
      }),
      viewerRole: user.role,
      canEdit: user.id === row.author_profile_id && status === "pending",
      canComment: true,
      canAdvance: user.role === "employee" && status !== "resolved",
    },
  };
}
