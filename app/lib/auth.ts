import { createMiddleware } from "@tanstack/start";
import { validateRequest } from "~/utils/auth";
import { redirect } from "@tanstack/react-router";

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next }) => {
    const { user } = await validateRequest();

    if (!user) {
      throw redirect({
        to: "/unauthenticated",
      });
    }

    return next({
      context: {
        userId: user.id,
      },
    });
  }
);
