import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import CoachConsole from "../ui/coach-console";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/");

  return <CoachConsole user={session.user} />;
}