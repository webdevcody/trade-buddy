import { createFileRoute, Link } from "@tanstack/react-router";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { getCoursesUseCase } from "~/use-cases/courses";
import { CourseCard } from "./-components/course-card";
import { createServerFn } from "@tanstack/start";
import { Container } from "./-components/container";

const getCoursesFn = createServerFn().handler(() => {
  return getCoursesUseCase();
});

export const Route = createFileRoute("/courses/")({
  component: RouteComponent,
  loader: async () => {
    const courses = await getCoursesFn();
    return { courses };
  },
});

function RouteComponent() {
  const { courses } = Route.useLoaderData();

  return (
    <Container>
      <Title
        title="Browse Courses"
        actions={
          <Link to="/courses/add">
            <Button>Add Course</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </Container>
  );
}
