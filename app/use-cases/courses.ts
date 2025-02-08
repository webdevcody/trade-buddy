import { createCourse, getCourse, getCourses } from "~/data-access/courses";
import { Course, CourseCreate, User } from "~/db/schema";

export function createCourseUseCase(userId: User["id"], course: CourseCreate) {
  return createCourse({ ...course, userId });
}

export function getCoursesUseCase() {
  return getCourses();
}

export function getCourseUseCase(courseId: Course["id"]) {
  return getCourse(courseId);
}

export async function isCourseAdminUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  const course = await getCourse(courseId);
  return course.userId === userId;
}
