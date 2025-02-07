import { createMiddleware } from "@tanstack/start";
import { validateRequest } from "~/utils/auth";

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next }) => {
    const { user } = await validateRequest();

    if (!user) {
      throw new Error("User not found");
    }

    return next({
      context: {
        userId: user.id,
      },
    });
  }
);
