import { eq, desc } from "drizzle-orm";
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
    orderBy: (snapshots) => desc(snapshots.createdAt),
  });
}

export async function createSnapshot(
  snapshot: ChartSnapshotCreate & {
    images?: {
      timeframe: string;
      imageId: string;
      analysis?: {
        recommendation: "LONG" | "SHORT" | "WAIT";
        confidence: number;
        analysis: string;
        patterns: string[];
      };
    }[];
  }
) {
  const { images, timeframe, ...snapshotData } = snapshot;

  // Create the snapshot first
  const [created] = await database
    .insert(chartSnapshots)
    .values({
      ...snapshotData,
      timeframe: timeframe || images?.[0]?.timeframe || "1m", // Use first image timeframe as fallback
    })
    .returning();

  // If we have images, create the screenshot entries
  if (images && images.length > 0) {
    await database.insert(chartScreenshots).values(
      images.map((image) => ({
        snapshotId: created.id,
        fileKey: image.imageId,
        timeframe: image.timeframe,
        analysis: image.analysis?.analysis,
        recommendation: image.analysis?.recommendation,
        confidence: image.analysis?.confidence,
        patterns: image.analysis?.patterns,
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
