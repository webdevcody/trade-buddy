import { User } from "~/db/schema";
import { getSnapshotsByUserId, createSnapshot } from "~/data-access/snapshots";
import type { ChartSnapshotCreate } from "~/db/schema";

export async function getSnapshotsUseCase(userId: User["id"]) {
  return getSnapshotsByUserId(userId);
}

export async function createSnapshotUseCase(
  userId: User["id"],
  data: Omit<ChartSnapshotCreate, "userId">
) {
  return createSnapshot({
    ...data,
    userId,
  });
}
