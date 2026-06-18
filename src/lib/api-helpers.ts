import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

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
