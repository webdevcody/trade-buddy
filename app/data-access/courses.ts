import {
  Course,
  CourseCreate,
  courseBookmarks,
  courses,
  User,
} from "~/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { database } from "~/db";

export async function createCourse(course: CourseCreate) {
  const inserted = await database.insert(courses).values(course).returning();
  return inserted[0];
}

export interface GetCoursesOptions {
  search?: string;
  category?: string;
}

export async function getCourses(options?: GetCoursesOptions) {
  const query = database.select().from(courses);

  const conditions = [];

  if (options?.search) {
    conditions.push(ilike(courses.title, `%${options.search}%`));
  }

  if (options?.category) {
    conditions.push(eq(courses.category, options.category));
  }

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

export async function getCourse(courseId: Course["id"]) {
  const result = await database
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  return result[0];
}

export async function bookmarkCourse(
  userId: User["id"],
  courseId: Course["id"]
) {
  const inserted = await database
    .insert(courseBookmarks)
    .values({ userId, courseId })
    .returning();
  return inserted[0];
}

export async function unbookmarkCourse(
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

export async function isBookmarked(userId: User["id"], courseId: Course["id"]) {
  const bookmark = await database
    .select()
    .from(courseBookmarks)
    .where(
      and(
        eq(courseBookmarks.userId, userId),
        eq(courseBookmarks.courseId, courseId)
      )
    )
    .limit(1);
  return bookmark.length > 0;
}

export async function getBookmarkedCourses(userId: User["id"]) {
  const bookmarkedCourses = await database
    .select({
      course: courses,
    })
    .from(courseBookmarks)
    .innerJoin(courses, eq(courses.id, courseBookmarks.courseId))
    .where(eq(courseBookmarks.userId, userId));

  return bookmarkedCourses.map(({ course }) => course);
}
