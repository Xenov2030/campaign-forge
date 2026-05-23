import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "campaign-forge-dev-secret-change-in-production"
);
const COOKIE_NAME = "cf_session";
const EXPIRY = "7d";

// ── Token ────────────────────────────────────────────────────
export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}

// ── Session ──────────────────────────────────────────────────
export async function setSession(userId: string): Promise<void> {
  const token = await signToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const userId = await verifyToken(token);
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch {
    return null;
  }
}

// ── Password ─────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Register ─────────────────────────────────────────────────
async function generateUniqueUsername(base: string): Promise<string> {
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30) || "usuario";

  const existing = await prisma.user.findUnique({ where: { username: slug } });
  if (!existing) return slug;

  let suffix = 2;
  while (true) {
    const candidate = `${slug}_${suffix}`;
    const collision = await prisma.user.findUnique({ where: { username: candidate } });
    if (!collision) return candidate;
    suffix++;
  }
}

export async function registerUser(data: {
  email: string;
  fullName: string;
  displayName: string;
  password: string;
}) {
  const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new Error("Este email ya está registrado");

  const username = await generateUniqueUsername(data.fullName);
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username,
      displayName: data.displayName.trim() || data.fullName.trim(),
      passwordHash,
    },
  });

  return user;
}

// ── Login ─────────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new Error("Email o contraseña incorrectos");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("Email o contraseña incorrectos");
  }

  return user;
}
