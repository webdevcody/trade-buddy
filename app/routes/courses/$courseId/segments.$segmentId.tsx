import { createFileRoute, redirect } from "@tanstack/react-router";
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
import { getSegmentUseCase } from "~/use-cases/segments";
import { NotFound } from "~/components/NotFound";
import { getSegmentsByCourseId } from "~/data-access/segments";
import { Course, Segment } from "~/db/schema";

const getSegmentInfoFn = createServerFn()
  .validator(
    z.object({
      courseId: z.coerce.number(),
      segmentId: z.coerce.number(),
    })
  )
  .handler(async ({ data }) => {
    return await Promise.all([
      getCourseUseCase(data.courseId),
      getSegmentUseCase(data.segmentId),
      getSegmentsByCourseId(data.courseId),
    ]);
  });

export const Route = createFileRoute("/courses/$courseId/segments/$segmentId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const courseInfo = await getSegmentInfoFn({
      data: {
        courseId: Number(params.courseId),
        segmentId: Number(params.segmentId),
      },
    });
    const [course, segment, segments] = courseInfo;

    if (!segment) {
      throw redirect({
        to: "/", // TODO: redirect to a 404 page
      });
    }

    return { course, segment, segments };
  },
});

function CourseContent({
  course,
  segments,
  currentSegment,
  currentSegmentId,
}: {
  course: Course;
  segments: Segment[];
  currentSegment: Segment;
  currentSegmentId: Segment["id"];
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
        {/* Mobile Navigation */}
        <MobileNavigation
          segments={segments}
          currentSegmentId={currentSegmentId}
          isOpen={openMobile}
          onClose={() => setOpenMobile(false)}
        />

        <main className="w-full p-6 pt-4">
          {/* Mobile Sidebar Toggle */}
          <div className="space-y-8">
            <Button
              size="icon"
              className="z-50 md:hidden hover:bg-accent"
              onClick={() => setOpenMobile(true)}
            >
              <Menu />
              <span className="sr-only">Toggle course navigation</span>
            </Button>

            <h1 className="text-2xl font-bold">{currentSegment.title}</h1>
            <div className="w-full">
              <VideoPlayer url={currentSegment.videoUrl} />
            </div>
            <MarkdownContent content={currentSegment.content} />
            <AssignmentViewer assignments={currentSegment.assignments ?? []} />
            <Navigation prevSegment={prevSegment} nextSegment={nextSegment} />
          </div>
        </main>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { course, segment, segments } = Route.useLoaderData();

  const currentSegmentId = segment?.id;

  if (!currentSegmentId) {
    return <NotFound />;
  }

  return (
    <SidebarProvider>
      <CourseContent
        course={course}
        segments={segments}
        currentSegment={segment}
        currentSegmentId={currentSegmentId.toString()}
      />
    </SidebarProvider>
  );
}
