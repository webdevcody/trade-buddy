import { getAttachment } from "~/data-access/attachments";
import { getCourse } from "~/data-access/courses";
import {
  createAttachment,
  deleteAttachment,
  getSegmentById,
} from "~/data-access/segments";
import { AttachmentCreate, Segment, User } from "~/db/schema";
import { deleteFile } from "~/storage";

async function assertAccessToSegment(userId: User["id"], segmentId: number) {
  const segment = await getSegmentById(segmentId);

  if (!segment) {
    throw new Error("Segment not found");
  }

  const course = await getCourse(segment.courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.userId !== userId) {
    throw new Error("You are not allowed to delete this attachment");
  }

  return segment;
}

export async function deleteAttachmentUseCase(
  userId: User["id"],
  attachmentId: number
) {
  const attachment = await getAttachment(attachmentId);

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await assertAccessToSegment(userId, attachment.segmentId);

  await deleteFile(attachment.fileKey);
  return deleteAttachment(attachmentId);
}

export async function createAttachmentUseCase(
  userId: User["id"],
  attachment: {
    segmentId: Segment["id"];
    fileName: string;
    fileKey: string;
  }
) {
  await assertAccessToSegment(userId, attachment.segmentId);
  return createAttachment({
    segmentId: attachment.segmentId,
    fileName: attachment.fileName,
    fileKey: attachment.fileKey,
  });
}
