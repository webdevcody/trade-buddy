import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { getCourseUseCase } from "~/use-cases/courses";
import { VideoPlayer } from "./-components/video-player";
import { Button } from "~/components/ui/button";
import React from "react";
import { getSegmentsUseCase } from "~/use-cases/segments";
import { ChevronRight, GraduationCap } from "lucide-react";
import { cn } from "~/lib/utils";
import { Container } from "../-components/container";
import { Title } from "~/components/title";
import { validateRequest } from "~/utils/auth";
import {
  bookmarkCourseUseCase,
  isBookmarkedUseCase,
  unbookmarkCourseUseCase,
} from "~/use-cases/bookmarks";

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
    const course = await getCourseFn({
      data: { courseId: parseInt(params.courseId) },
    });
    const segments = await getSegmentsUseCase(course.id);
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
            variant={isBookmarked ? "secondary" : "outline"}
            onClick={handleBookmarkToggle}
            className="flex-shrink-0 transition-colors"
            aria-pressed={isBookmarked}
          >
            <GraduationCap
              className={cn(
                "h-5 w-5 mr-2 transition-all",
                isBookmarked ? "fill-current" : "fill-none"
              )}
            />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
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
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Course Content</h2>
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div
              key={segment.id}
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {index + 1}. {segment.title}
                  </h3>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
