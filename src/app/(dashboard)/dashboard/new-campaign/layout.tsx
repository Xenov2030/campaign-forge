import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

// Guard de ruta: solo MASTER/ADMIN pueden acceder a la creación de campañas.
// Un PLAYER que entre por URL directa es redirigido al dashboard.
export default async function NewCampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role === "PLAYER") redirect("/dashboard");

  return <>{children}</>;
}
