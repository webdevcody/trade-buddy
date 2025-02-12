import {
  createCourse,
  getBookmarkedCourses,
  getCourse,
  getCourses,
  GetCoursesOptions,
  updateCourse,
} from "~/data-access/courses";
import { getSegmentsByCourseId } from "~/data-access/segments";
import { Course, CourseCreate, CourseUpdate, User } from "~/db/schema";
import { deleteFile } from "~/storage";

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

export async function updateCourseUseCase(
  courseId: Course["id"],
  userId: User["id"],
  data: CourseUpdate
) {
  const course = await getCourse(courseId);
  if (!course) throw new Error("Course not found");
  if (course.userId !== userId) throw new Error("Not authorized");

  if (course.videoKey && data.videoKey) {
    await deleteFile(course.videoKey);
  }

  return updateCourse(courseId, data);
}
