import { Course, courses } from "~/db/schema";

import { database } from "~/db";
import { CourseCreate } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function createCourse(course: CourseCreate) {
  const inserted = await database.insert(courses).values(course).returning();
  return inserted[0];
}

export async function getCourses() {
  return database.select().from(courses);
}

export async function getCourse(courseId: Course["id"]) {
  const result = await database
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  return result[0];
}
