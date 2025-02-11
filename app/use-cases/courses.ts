import {
  bookmarkCourse,
  createCourse,
  getCourse,
  getCourses,
  getBookmarkedCourses,
  isBookmarked,
  unbookmarkCourse,
  GetCoursesOptions,
} from "~/data-access/courses";
import { Course, CourseCreate, User } from "~/db/schema";

export function createCourseUseCase(userId: User["id"], course: CourseCreate) {
  return createCourse({ ...course, userId });
}

export function getCoursesUseCase(options?: GetCoursesOptions) {
  return getCourses(options);
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

export function bookmarkCourseUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  return bookmarkCourse(userId, courseId);
}

export function unbookmarkCourseUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  return unbookmarkCourse(userId, courseId);
}

export function isBookmarkedUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  return isBookmarked(userId, courseId);
}

export function getBookmarkedCoursesUseCase(userId: User["id"]) {
  return getBookmarkedCourses(userId);
}
