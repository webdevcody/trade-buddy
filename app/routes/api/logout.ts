import { createAPIFileRoute } from "@tanstack/start/api";
import {
  invalidateSession,
  invalidateUserSessions,
  validateRequest,
} from "~/utils/auth";
import { assertAuthenticated, deleteSessionTokenCookie } from "~/utils/session";

export const APIRoute = createAPIFileRoute("/api/logout")({
  GET: async ({ request, params }) => {
    const { session } = await validateRequest();
    if (!session) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }
    await invalidateSession(session?.id);
    await deleteSessionTokenCookie();
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  },
});
