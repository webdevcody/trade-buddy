import { createFileRoute } from "@tanstack/react-router";
import { Title } from "~/components/title";
import { AddCourseForm } from "./-components/add-course-form";
import { Container } from "./-components/container";

export const Route = createFileRoute("/courses/add")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container>
      <Title title="Create a Course" />

      <AddCourseForm />
    </Container>
  );
}
