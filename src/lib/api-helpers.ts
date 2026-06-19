import { type NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { type ZodSchema } from "zod";

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

/**
 * Retorna { user } o un NextResponse 401.
 * Uso: const r = await requireAuth(); if (r instanceof NextResponse) return r;
 *      const { user } = r;
 */
export async function requireAuth(): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { user };
}

/**
 * Valida que el usuario sea miembro activo de la campaña.
 * Retorna { member } o un NextResponse 403.
 */
export async function requireMember(
  campaignId: string,
  userId: string,
): Promise<
  | {
      member: {
        campaignId: string;
        userId: string;
        role: string;
      };
    }
  | NextResponse
> {
  const member = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
    select: { campaignId: true, userId: true, role: true },
  });
  if (!member)
    return NextResponse.json(
      { error: "No eres miembro de esta campaña" },
      { status: 403 },
    );
  return { member };
}

/**
 * Parsea y valida el body de un request contra un schema Zod.
 * Retorna { data } o { error: NextResponse } con 400.
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { data: null, error: NextResponse.json({ error: "JSON inválido" }, { status: 400 }) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Datos inválidos";
    return { data: null, error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data, error: null };
}
