import { and, desc, eq, gt, lt } from "drizzle-orm";
import { database } from "~/db";
import { segments, type Segment, type SegmentCreate } from "~/db/schema";

export async function getSegmentsByCourseId(courseId: number) {
  return database.query.segments.findMany({
    where: eq(segments.courseId, courseId),
    orderBy: segments.order,
  });
}

export async function getSegmentById(id: number) {
  return database.query.segments.findFirst({
    where: eq(segments.id, id),
  });
}

export async function createSegment(segment: SegmentCreate) {
  const [createdSegment] = await database
    .insert(segments)
    .values(segment)
    .returning();
  return createdSegment;
}

export async function updateSegment(
  id: number,
  segment: Partial<SegmentCreate>
) {
  const [updatedSegment] = await database
    .update(segments)
    .set({ ...segment, updatedAt: new Date() })
    .where(eq(segments.id, id))
    .returning();
  return updatedSegment;
}

export async function deleteSegment(id: number) {
  const [deletedSegment] = await database
    .delete(segments)
    .where(eq(segments.id, id))
    .returning();
  return deletedSegment;
}

export async function getNextSegment(courseId: number, currentOrder: number) {
  return database.query.segments.findFirst({
    where: and(
      eq(segments.courseId, courseId),
      gt(segments.order, currentOrder)
    ),
    orderBy: segments.order,
  });
}

export async function getPreviousSegment(
  courseId: number,
  currentOrder: number
) {
  return database.query.segments.findFirst({
    where: and(
      eq(segments.courseId, courseId),
      lt(segments.order, currentOrder)
    ),
    orderBy: desc(segments.order),
  });
}
