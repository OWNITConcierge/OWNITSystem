import { getServerSession } from "next-auth";
import CoachConsole from "../ui/coach-console";

// If you already have authOptions exported somewhere, import it and pass to getServerSession(authOptions).
// If not, this still works in many setups where NextAuth is configured with default in route handlers.
// If your project requires authOptions, tell me where your NextAuth config is and I’ll wire it exactly.

export default async function CoachConsolePage() {
  const session = await getServerSession();

  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : { name: null, email: null, image: null };

  return <CoachConsole user={user} />;
}