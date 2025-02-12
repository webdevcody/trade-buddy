import {
  createSegment,
  deleteSegment,
  getNextSegment,
  getPreviousSegment,
  getSegmentById,
  getSegmentsByCourseId,
  updateSegment,
} from "~/data-access/segments";
import type { SegmentCreate } from "~/db/schema";

export async function getSegmentsUseCase(courseId: number) {
  return getSegmentsByCourseId(courseId);
}

export async function getSegmentUseCase(id: number) {
  return getSegmentById(id);
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
