import {
  Course,
  courseBookmarks,
  CourseCreate,
  courses,
  User,
} from "~/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { database } from "~/db";

export type GetCoursesOptions = {
  search?: string;
  category?: string;
};

export async function createCourse(course: CourseCreate) {
  const inserted = await database.insert(courses).values(course).returning();
  return inserted[0];
}

export async function getCourse(courseId: Course["id"]) {
  const course = await database
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  return course[0];
}

export async function getCourses(options?: GetCoursesOptions) {
  const conditions = [];

  if (options?.search) {
    conditions.push(
      or(
        ilike(courses.title, `%${options.search}%`),
        ilike(courses.category, `%${options.search}%`)
      )
    );
  }

  if (options?.category) {
    conditions.push(eq(courses.category, options.category));
  }

  const query = database.select().from(courses);

  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }

  return query;
}

export async function getBookmarkedCourses(userId: User["id"]) {
  return database.query.courseBookmarks.findMany({
    where: eq(courseBookmarks.userId, userId),
    with: {
      course: true,
    },
  });
}
