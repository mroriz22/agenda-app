import { redirect } from "next/navigation";

/**
 * O produto do SmartDayZ é a agenda (/app). /dashboard continua existindo
 * porque links antigos apontam pra cá.
 */
export default function DashboardPage() {
  redirect("/app");
}
