import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/api";

export default async function CategoriesPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }
  redirect("/legatee/admin/panel");
}
