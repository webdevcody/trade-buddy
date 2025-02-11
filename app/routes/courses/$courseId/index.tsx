import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { useSidebar } from "~/components/ui/sidebar";
import {
  getCourseUseCase,
  isBookmarkedUseCase,
  bookmarkCourseUseCase,
  unbookmarkCourseUseCase,
} from "~/use-cases/courses";
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
import { Link } from "@tanstack/react-router";
import { ChevronRight, BookmarkIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Container } from "../-components/container";
import { Title } from "~/components/title";
import { validateRequest } from "~/utils/auth";

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

const toggleBookmarkFn = createServerFn()
  .validator(
    z.object({
      courseId: z.number(),
      isBookmarked: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    const { user } = await validateRequest();
    if (!user) throw new Error("Not authenticated");

    if (data.isBookmarked) {
      await unbookmarkCourseUseCase(user.id, data.courseId);
    } else {
      await bookmarkCourseUseCase(user.id, data.courseId);
    }
    return !data.isBookmarked;
  });

const getIsBookmarkedFn = createServerFn()
  .validator(
    z.object({
      courseId: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const { user } = await validateRequest();
    if (!user) return false;
    return isBookmarkedUseCase(user.id, data.courseId);
  });

export const Route = createFileRoute("/courses/$courseId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [course, segments] = await Promise.all([
      getCourseFn({
        data: { courseId: Number(params.courseId) },
      }),
      getSegmentsUseCase(Number(params.courseId)),
    ]);
    return { course, segments };
  },
});

function RouteComponent() {
  const { course, segments } = Route.useLoaderData();
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    getIsBookmarkedFn({ data: { courseId: course.id } }).then(setIsBookmarked);
  }, [course.id]);

  const handleBookmarkToggle = async () => {
    try {
      const newIsBookmarked = await toggleBookmarkFn({
        data: { courseId: course.id, isBookmarked },
      });
      setIsBookmarked(newIsBookmarked);
    } catch (error) {
      // TODO: Show login modal or redirect to login
      console.error("Failed to toggle bookmark:", error);
    }
  };

  return (
    <Container>
      {/* Course Header */}
      <Title
        title={course.title}
        actions={
          <Button
            variant="ghost"
            onClick={handleBookmarkToggle}
            className="flex-shrink-0"
          >
            <BookmarkIcon
              className={cn(
                "h-5 w-5",
                isBookmarked ? "fill-current" : "fill-none"
              )}
            />
            {isBookmarked ? "Unenroll" : "Enroll"}
          </Button>
        }
      />

      <p className="text-xl text-muted-foreground">
        Welcome to {course.title}! Get ready to embark on an exciting learning
        journey.
      </p>

      {/* Course Intro Video */}
      <div className="w-full mx-auto">
        <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </div>

      {/* Course Description */}
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">About this Course</h2>
        <p>
          This comprehensive course will take you through everything you need to
          know about {course.title}. Whether you're a beginner or looking to
          refresh your knowledge, we've got you covered with step-by-step
          lessons and practical exercises.
        </p>
      </div>

      {/* Segments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Course Content</h2>
        <div className="grid gap-4">
          {segments.map((segment, index) => (
            <Link
              key={segment.id}
              to="/courses/$courseId/segments/$segmentId"
              params={{
                courseId: course.id.toString(),
                segmentId: segment.id,
              }}
              className={cn(
                "group p-4 border rounded-lg hover:bg-accent transition-colors",
                "flex items-center justify-between"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 size-6 flex items-center justify-center rounded-full bg-muted font-medium text-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-medium">{segment.title}</h3>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
