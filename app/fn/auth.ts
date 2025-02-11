import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { validateRequest } from "~/utils/auth";

export const isAuthenticatedFn = createServerFn().handler(async () => {
  const { user } = await validateRequest();
  return !!user;
});

export const assertAuthenticatedFn = createServerFn().handler(async () => {
  if (!(await isAuthenticatedFn())) {
    throw redirect({
      to: "/unauthenticated",
    });
  }
});
