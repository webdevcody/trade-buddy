import { getCourse } from "~/data-access/courses";
import {
  createSegment,
  deleteSegment,
  getNextSegment,
  getPreviousSegment,
  getSegmentById,
  getSegmentsByCourseId,
  updateSegment,
  getSegmentAttachments,
  deleteAttachment,
} from "~/data-access/segments";
import type { Segment, SegmentCreate, User } from "~/db/schema";
import { deleteFile } from "~/storage";

export async function assertAccessToSegment(
  userId: User["id"],
  segmentId: number
) {
  const segment = await getSegmentById(segmentId);
  if (!segment) throw new Error("Segment not found");
  const course = await getCourse(segment.courseId);
  if (!course) throw new Error("Course not found");
  if (course.userId !== userId) {
    throw new Error("You are not allowed to delete this segment");
  }
  return segment;
}

export async function getSegmentsUseCase(courseId: number) {
  return getSegmentsByCourseId(courseId);
}

export async function getSegmentUseCase(segmentId: Segment["id"]) {
  return getSegmentById(segmentId);
}

export async function addSegmentUseCase(segment: SegmentCreate) {
  return createSegment(segment);
}

export async function editSegmentUseCase(
  id: number,
  segment: Partial<SegmentCreate>
) {
  return updateSegment(id, segment);
}

export async function removeSegmentUseCase(id: number) {
  return deleteSegment(id);
}

export async function getSegmentNavigationUseCase(
  courseId: number,
  currentOrder: number
) {
  const [prevSegment, nextSegment] = await Promise.all([
    getPreviousSegment(courseId, currentOrder),
    getNextSegment(courseId, currentOrder),
  ]);

  return {
    prevSegment,
    nextSegment,
  };
}

export async function updateSegmentUseCase(
  segmentId: number,
  data: {
    title: string;
    content: string;
    videoKey?: string;
  }
) {
  const { title, content, videoKey } = data;

  const segment = await getSegmentById(segmentId);
  if (!segment) throw new Error("Segment not found");

  if (segment.videoKey && videoKey) {
    await deleteFile(segment.videoKey);
  }

  return await updateSegment(segmentId, { title, content, videoKey });
}

export async function deleteSegmentUseCase(
  userId: User["id"],
  segmentId: number
) {
  const segment = await assertAccessToSegment(userId, segmentId);

  // Delete video file if it exists
  if (segment.videoKey) {
    await deleteFile(segment.videoKey);
  }

  // Get and delete all attachment files
  const attachments = await getSegmentAttachments(segmentId);
  await Promise.all(
    attachments.map(async (attachment) => {
      await deleteFile(attachment.fileKey);
      await deleteAttachment(attachment.id);
    })
  );

  // Finally delete the segment (this will cascade delete attachments due to foreign key)
  return deleteSegment(segmentId);
}
