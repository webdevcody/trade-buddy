import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { SidebarProvider, useSidebar } from "~/components/ui/sidebar";
import { getCourseUseCase } from "~/use-cases/courses";
import { VideoPlayer } from "./-components/video-player";
import { MarkdownContent } from "./-components/markdown-content";
import { AssignmentViewer } from "./-components/assignment-viewer";
import { Navigation } from "./-components/navigation";
import { Button } from "~/components/ui/button";
import { Menu } from "lucide-react";
import { DesktopNavigation } from "./-components/desktop-navigation";
import { MobileNavigation } from "./-components/mobile-navigation";
import React from "react";
import { getSegmentsUseCase } from "~/use-cases/segments";

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

export const Route = createFileRoute("/courses/$courseId/segments/$segmentId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const course = await getCourseFn({
      data: { courseId: Number(params.courseId) },
    });
    const segments = await getSegmentsUseCase(course.id);
    return { course, segments };
  },
});

function CourseContent({
  course,
  segments,
  currentSegment,
  currentSegmentId,
}: {
  course: any;
  segments: any[];
  currentSegment: any;
  currentSegmentId: string;
}) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  // Close mobile navigation when switching to desktop
  React.useEffect(() => {
    if (!isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, openMobile, setOpenMobile]);

  const previousSegmentId =
    segments.findIndex((segment) => segment.id === currentSegmentId) - 1;
  const nextSegmentId =
    segments.findIndex((segment) => segment.id === currentSegmentId) + 1;

  const prevSegment =
    previousSegmentId >= 0 ? segments[previousSegmentId] : null;
  const nextSegment =
    nextSegmentId < segments.length ? segments[nextSegmentId] : null;

  return (
    <div className="flex w-full">
      {/* Desktop Navigation */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <DesktopNavigation
          segments={segments}
          courseId={course.id}
          currentSegmentId={currentSegmentId}
        />
      </div>

      <div className="flex-1 w-full">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-[4.5rem] z-50 md:hidden hover:bg-accent"
          onClick={() => setOpenMobile(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle course navigation</span>
        </Button>

        {/* Mobile Navigation */}
        <MobileNavigation
          segments={segments}
          currentSegmentId={currentSegmentId}
          isOpen={openMobile}
          onClose={() => setOpenMobile(false)}
        />

        <main className="w-full p-6">
          <div className="space-y-8">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="w-full aspect-video">
              <VideoPlayer url={currentSegment.videoUrl} />
            </div>
            <MarkdownContent content={currentSegment.content} />
            <AssignmentViewer assignments={currentSegment.assignments} />
            <Navigation prevSegment={prevSegment} nextSegment={nextSegment} />
          </div>
        </main>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { course, segments } = Route.useLoaderData();

  const currentSegment = segments[0];
  const currentSegmentId = currentSegment.id;

  return (
    <SidebarProvider>
      <CourseContent
        course={course}
        segments={segments}
        currentSegment={currentSegment}
        currentSegmentId={currentSegmentId}
      />
    </SidebarProvider>
  );
}
