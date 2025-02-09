import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { getCourseUseCase } from "~/use-cases/courses";
import { CourseSegments } from "./-components/course-segments";
import { VideoPlayer } from "./-components/video-player";
import { MarkdownContent } from "./-components/markdown-content";
import { AssignmentViewer } from "./-components/assignment-viewer";
import { Navigation } from "./-components/navigation";

const getCourseFn = createServerFn()
  .validator(
    z.object({
      courseId: z.coerce.number(),
    })
  )
  .handler(async ({ data }) => {
    const course = await getCourseUseCase(data.courseId);
    return course;
  });

export const Route = createFileRoute("/courses/$courseId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const course = await getCourseFn({
      data: { courseId: Number(params.courseId) },
    });
    return { course };
  },
});

function RouteComponent() {
  const { course } = Route.useLoaderData();

  const segments = [
    {
      id: "1",
      title: "Segment 1",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "This is the content of segment 1",
      assignments: ["Assignment 1", "Assignment 2"],
    },
    {
      id: "2",
      title: "Segment 2",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      content: "This is the content of segment 2",
      assignments: ["Assignment 1", "Assignment 2"],
    },
  ];

  const currentSegment = segments[0];
  const currentSegmentId = currentSegment.id;

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-64">
          <SidebarContent>
            <CourseSegments
              segments={segments}
              currentSegmentId={currentSegmentId}
            />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1 overflow-auto">
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
            <VideoPlayer url={currentSegment.videoUrl} />
            <MarkdownContent content={currentSegment.content} />
            <AssignmentViewer assignments={currentSegment.assignments} />
            <Navigation prevSegment={segments[0]} nextSegment={segments[1]} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
