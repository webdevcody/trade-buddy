import { eq } from "drizzle-orm";
import { database } from "~/db";
import {
  chartSnapshots,
  chartScreenshots,
  ChartSnapshotCreate,
} from "~/db/schema";

export async function getSnapshotsByUserId(userId: number) {
  return database.query.chartSnapshots.findMany({
    where: eq(chartSnapshots.userId, userId),
    with: {
      screenshots: true,
    },
    orderBy: (snapshots) => snapshots.createdAt,
  });
}

export async function createSnapshot(
  snapshot: ChartSnapshotCreate & {
    images?: { timeframe: string; imageId: string }[];
  }
) {
  const { images, ...snapshotData } = snapshot;

  // Create the snapshot first
  const [created] = await database
    .insert(chartSnapshots)
    .values(snapshotData)
    .returning();

  // If we have images, create the screenshot entries
  if (images && images.length > 0) {
    await database.insert(chartScreenshots).values(
      images.map((image) => ({
        snapshotId: created.id,
        fileKey: image.imageId,
        timeframe: image.timeframe,
      }))
    );
  }

  // Return the created snapshot with its screenshots
  return database.query.chartSnapshots.findFirst({
    where: eq(chartSnapshots.id, created.id),
    with: {
      screenshots: true,
    },
  });
}
