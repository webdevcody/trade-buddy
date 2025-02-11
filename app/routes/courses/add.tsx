import { createFileRoute, redirect } from "@tanstack/react-router";
import { Title } from "~/components/title";
import { AddCourseForm } from "./-components/add-course-form";
import { Container } from "./-components/container";
import { assertAuthenticatedFn, isAuthenticatedFn } from "~/fn/auth";

export const Route = createFileRoute("/courses/add")({
  component: RouteComponent,
  loader: async () => {
    await assertAuthenticatedFn();
  },
});

function RouteComponent() {
  return (
    <Container>
      <Title title="Create a Course" />

      <AddCourseForm />
    </Container>
  );
}
