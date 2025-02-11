import { Link } from "@tanstack/react-router";
import { BookmarkIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Course } from "~/db/schema";
import { cn } from "~/lib/utils";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import {
  bookmarkCourseUseCase,
  isBookmarkedUseCase,
  unbookmarkCourseUseCase,
} from "~/use-cases/courses";
import { validateRequest } from "~/utils/auth";
import React from "react";

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

export function CourseCard({ course }: { course: Course }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{course.title}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmarkToggle}
            className="flex-shrink-0"
          >
            <BookmarkIcon
              className={cn(
                "h-5 w-5",
                isBookmarked ? "fill-current" : "fill-none"
              )}
            />
            <span className="sr-only">
              {isBookmarked ? "Remove bookmark" : "Add bookmark"}
            </span>
          </Button>
        </CardTitle>
        <CardDescription>{course.category}</CardDescription>
      </CardHeader>
      {/* <CardContent>
        <p>{exercise.reps} reps</p>
        <p>{exercise.sets} sets</p>
      </CardContent> */}
      <CardFooter>
        <Link
          to="/courses/$courseId"
          params={{ courseId: course.id.toString() }}
        >
          <Button>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
