import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";
import { database } from "~/db";
import { Course, courseBookmarks, User } from "~/db/schema";

export async function bookmarkCourseUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  await database.insert(courseBookmarks).values({ userId, courseId });
}

export async function getBookMarkedCoursesUseCase(userId: User["id"]) {
  return database.query.courseBookmarks.findMany({
    where: eq(courseBookmarks.userId, userId),
    with: {
      course: true,
    },
  });
}

export async function unbookmarkCourseUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  await database
    .delete(courseBookmarks)
    .where(
      and(
        eq(courseBookmarks.userId, userId),
        eq(courseBookmarks.courseId, courseId)
      )
    );
}

export async function isBookmarkedUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  const [bookmark] = await database
    .select()
    .from(courseBookmarks)
    .where(
      and(
        eq(courseBookmarks.userId, userId),
        eq(courseBookmarks.courseId, courseId)
      )
    );
  return bookmark !== undefined;
}
