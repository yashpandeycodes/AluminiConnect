import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "ALUMNI") {
    redirect("/dashboard/alumni");
  } else {
    redirect("/dashboard/student");
  }
}
