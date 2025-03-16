import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { Button } from "~/components/ui/button";
import { ChartBar, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { assertAuthenticatedFn } from "~/fn/auth";
import { getSnapshotsUseCase } from "~/use-cases/snapshots";
import { Link } from "@tanstack/react-router";
import { getStorageUrl } from "~/utils/storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const getSnapshotsFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const snapshots = await getSnapshotsUseCase(context.userId);
    return snapshots;
  });

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  loader: async () => {
    const snapshots = await getSnapshotsFn();
    return { snapshots };
  },
});

function RouteComponent() {
  const { snapshots } = Route.useLoaderData();

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <ChartBar className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Chart Snapshots</h2>
        <p className="text-muted-foreground mb-4">
          You haven't created any chart snapshots yet. Start capturing your
          trading analysis!
        </p>
        <Link to="/dashboard/charts/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Snapshot
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Chart Snapshots</h1>
        <Link to="/dashboard/charts/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Snapshot
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {snapshots.map((snapshot) => (
          <Link
            key={snapshot.id}
            to="/dashboard/charts/$snapshotId"
            params={{ snapshotId: snapshot.id.toString() }}
          >
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>{snapshot.symbol}</CardTitle>
                <CardDescription>
                  Timeframe: {snapshot.timeframe}
                </CardDescription>
              </CardHeader>
              {snapshot.screenshots[0] && (
                <CardContent>
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <img
                      src={getStorageUrl(snapshot.screenshots[0].fileKey)}
                      alt={`Chart snapshot for ${snapshot.symbol}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CardContent>
              )}
              <CardFooter className="text-sm text-muted-foreground">
                <div className="flex justify-between w-full">
                  <span>{snapshot.screenshots.length} screenshots</span>
                  <span>
                    Created {new Date(snapshot.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
