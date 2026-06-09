import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

// Guard único del panel de administración: solo ADMIN.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <>{children}</>;
}
