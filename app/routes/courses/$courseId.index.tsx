import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { getCourseUseCase, isCourseAdminUseCase } from "~/use-cases/courses";
import { Container } from "./-components/container";
import { Title } from "~/components/title";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Trash } from "lucide-react";
import { authenticatedMiddleware } from "~/lib/auth";

const getCourseFn = createServerFn()
  .validator(z.coerce.number())
  .handler(({ data: courseId }) => {
    return getCourseUseCase(courseId);
  });

const isCourseAdminFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(z.coerce.number())
  .handler(({ data: courseId, context }) => {
    return isCourseAdminUseCase(context.userId, courseId);
  });

export const Route = createFileRoute("/courses/$courseId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const courseId = Number(params.courseId);
    const course = await getCourseFn({
      data: courseId,
    });
    const isCourseAdmin = await isCourseAdminFn({
      data: courseId,
    });
    return { course, isCourseAdmin };
  },
});

function RouteComponent() {
  const { course, isCourseAdmin } = Route.useLoaderData();

  return (
    <Container>
      <div>
        <Badge>{course.category}</Badge>
      </div>
      <Title
        title={course.title}
        actions={
          isCourseAdmin ? (
            <Button
              onClick={() => {
                // deleteCourseFn({ data: course.id });
              }}
              variant="destructive"
              size="icon"
            >
              <Trash />
            </Button>
          ) : null
        }
      ></Title>
    </Container>
  );
}
