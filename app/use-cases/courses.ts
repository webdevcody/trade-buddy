import {
  createCourse,
  getBookmarkedCourses,
  getCourse,
  getCourses,
  GetCoursesOptions,
} from "~/data-access/courses";
import { getSegmentsByCourseId } from "~/data-access/segments";
import { Course, CourseCreate, User } from "~/db/schema";

export function createCourseUseCase(userId: User["id"], course: CourseCreate) {
  return createCourse({ ...course, userId });
}

export function getCourseUseCase(courseId: Course["id"]) {
  return getCourse(courseId);
}

export function getCoursesUseCase(options?: GetCoursesOptions) {
  return getCourses(options);
}

export async function isCourseAdminUseCase(
  userId: User["id"],
  courseId: Course["id"]
) {
  const course = await getCourse(courseId);
  return course.userId === userId;
}

export async function getBookmarkedCoursesUseCase(userId: User["id"]) {
  const enrolledCourses = await getBookmarkedCourses(userId);
  const coursesWithSegments = await Promise.all(
    enrolledCourses.map(async (enrollment) => {
      const segments = await getSegmentsByCourseId(enrollment.course.id);
      return {
        ...enrollment,
        totalSegments: segments.length,
      };
    })
  );
  return coursesWithSegments;
}
