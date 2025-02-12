import { createFileRoute } from "@tanstack/react-router";
import { Title } from "~/components/title";
import { AddCourseForm } from "./-components/add-course-form";
import { Container } from "./-components/container";
import { assertAuthenticatedFn } from "~/fn/auth";

export const Route = createFileRoute("/courses/add")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
});

function RouteComponent() {
  return (
    <Container>
      <Title title="Create a Course" />

      <AddCourseForm />
    </Container>
  );
}
