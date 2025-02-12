import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { getCourseUseCase, isCourseAdminUseCase } from "~/use-cases/courses";
import { VideoPlayer } from "./-components/video-player";
import { Button } from "~/components/ui/button";
import React from "react";
import { getSegmentsUseCase } from "~/use-cases/segments";
import { Bookmark, ChevronRight, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Container } from "../-components/container";
import { Title } from "~/components/title";
import { validateRequest } from "~/utils/auth";
import {
  bookmarkCourseUseCase,
  isBookmarkedUseCase,
  unbookmarkCourseUseCase,
} from "~/use-cases/bookmarks";
import { authenticatedMiddleware } from "~/lib/auth";

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

const getSegmentsFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(
    z.object({
      courseId: z.number(),
    })
  )
  .handler(async ({ data }) => {
    return getSegmentsUseCase(data.courseId);
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

const getIsAdminFn = createServerFn()
  .validator(
    z.object({
      courseId: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const { user } = await validateRequest();
    if (!user) return false;
    return isCourseAdminUseCase(user.id, data.courseId);
  });

export const Route = createFileRoute("/courses/$courseId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const course = await getCourseFn({
      data: { courseId: parseInt(params.courseId) },
    });
    const segments = await getSegmentsFn({
      data: { courseId: parseInt(params.courseId) },
    });
    return { course, segments };
  },
});

function RouteComponent() {
  const { course, segments } = Route.useLoaderData();
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    getIsBookmarkedFn({ data: { courseId: course.id } }).then(setIsBookmarked);
    getIsAdminFn({ data: { courseId: course.id } }).then(setIsAdmin);
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
            <Bookmark
              className={cn(
                "h-5 w-5 mr-2 transition-all",
                isBookmarked ? "fill-current" : "fill-none"
              )}
            />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
        }
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Course Info */}
        <div className="space-y-6">
          <p className="text-xl text-muted-foreground">
            Welcome to {course.title}! Get ready to embark on an exciting
            learning journey.
          </p>

          {/* Course Description */}
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">About this Course</h2>
            <p>
              This comprehensive course will take you through everything you
              need to know about {course.title}. Whether you're a beginner or
              looking to refresh your knowledge, we've got you covered with
              step-by-step lessons and practical exercises.
            </p>
          </div>
        </div>

        {/* Right Column - Video */}
        <div className="w-full">
          <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </div>
      </div>

      {/* Segments List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Course Content</h2>
          {isAdmin && (
            <Link
              to="/courses/$courseId/segments/$segmentId"
              params={{ courseId: course.id.toString(), segmentId: "add" }}
            >
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add Segment
              </Button>
            </Link>
          )}
        </div>

        {segments.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No segments yet
            </h3>
            {isAdmin ? (
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first course segment
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                The course content is being prepared. Check back soon!
              </p>
            )}
            {isAdmin && (
              <Link
                to="/courses/$courseId/segments/$segmentId"
                params={{ courseId: course.id.toString(), segmentId: "add" }}
              >
                <Button variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Segment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {segments.map((segment, index) => (
              <Link
                key={segment.id}
                to="/courses/$courseId/segments/$segmentId"
                params={{
                  courseId: course.id.toString(),
                  segmentId: segment.id.toString(),
                }}
              >
                <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {index + 1}. {segment.title}
                      </h3>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
