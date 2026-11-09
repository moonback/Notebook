import { NextResponse, type NextRequest } from "next/server";
import { ApiError, handle, requireRole, requireUser } from "@/lib/api";
import { createServiceClient, createUserClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

async function sourceNotebook(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(404, "not_found");
  const { data } = await createServiceClient().from("sources").select("notebook_id, storage_path").eq("id", id).single();
  if (!data) throw new ApiError(404, "not_found");
  return data;
}

/** Visionneuse (S10) : texte extrait normalisé, base des offsets de citation. Lecteur et plus (pas le rôle chat). */
export const GET = handle(async (_req: NextRequest, { params }: Params) => {
  await requireUser();
  const { id } = await params;
  const { notebook_id } = await sourceNotebook(id);
  await requireRole(notebook_id, "viewer");
  const supabase = await createUserClient();
  const { data, error } = await supabase.from("sources")
    .select("id, kind, title, status, error_code, origin_url, word_count, page_count, extracted_text, created_at").eq("id", id).single();
  if (error) throw error;
  return NextResponse.json({ source: data });
});

/** Suppression d'une source (éditeur) : chunks en cascade, fichier retiré de Storage. Les artefacts existants restent. */
export const DELETE = handle(async (_req: NextRequest, { params }: Params) => {
  await requireUser();
  const { id } = await params;
  const { notebook_id, storage_path } = await sourceNotebook(id);
  await requireRole(notebook_id, "editor");
  const db = createServiceClient();
  const { error } = await db.from("sources").delete().eq("id", id);
  if (error) throw error;
  if (storage_path) await db.storage.from("sources").remove([storage_path]);
  return new NextResponse(null, { status: 204 });
});
