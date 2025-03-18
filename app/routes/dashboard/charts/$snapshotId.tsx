import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { assertAuthenticatedFn } from "~/fn/auth";
import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { database } from "~/db";
import {
  chartSnapshots,
  type ChartSnapshot,
  type ChartScreenshot,
} from "~/db/schema";
import { eq } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getStorageUrl } from "~/utils/storage";
import { Card } from "~/components/ui/card";
import { Markdown } from "~/components/Markdown";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";

const snapshotParamsSchema = z.object({
  snapshotId: z.string().transform((val) => parseInt(val)),
});

const deleteSnapshotFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(snapshotParamsSchema)
  .handler(async ({ context, data }) => {
    await database
      .delete(chartSnapshots)
      .where(eq(chartSnapshots.id, data.snapshotId));
    return { success: true };
  });

const getSnapshotFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(snapshotParamsSchema)
  .handler(async ({ context, data }) => {
    const snapshot = await database.query.chartSnapshots.findFirst({
      where: eq(chartSnapshots.id, data.snapshotId),
      with: {
        screenshots: true,
      },
    });

    if (!snapshot) {
      throw new Error("Snapshot not found");
    }

    return snapshot;
  });

const TIMEFRAME_ORDER = ["1m", "5m", "15m", "30m", "1h", "4h"] as const;
type Timeframe = (typeof TIMEFRAME_ORDER)[number];

function getTimeframeOrder(timeframe: string): number {
  const index = TIMEFRAME_ORDER.indexOf(timeframe as Timeframe);
  return index === -1 ? Infinity : index;
}

export const Route = createFileRoute("/dashboard/charts/$snapshotId")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  loader: async ({ params }) => {
    const snapshot = await getSnapshotFn({
      data: { snapshotId: params.snapshotId },
    });
    return { snapshot };
  },
});

function AnalysisCard({ screenshot }: { screenshot: ChartScreenshot }) {
  if (!screenshot.analysis) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Markdown>{screenshot.analysis}</Markdown>

        {screenshot.patterns && screenshot.patterns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Detected Patterns:</h4>
            <ul className="list-disc pl-5">
              {screenshot.patterns.map((pattern, index) => (
                <li key={index}>{pattern}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

function RouteComponent() {
  const { snapshot } = Route.useLoaderData();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<"chart" | "analysis">(
    "chart"
  );

  // Sort screenshots by timeframe order
  const sortedScreenshots = [...snapshot.screenshots].sort(
    (a, b) => getTimeframeOrder(a.timeframe) - getTimeframeOrder(b.timeframe)
  );

  const handleDelete = async () => {
    await deleteSnapshotFn({
      data: { snapshotId: snapshot.id.toString() },
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{snapshot.symbol}</h1>
        </div>

        <div className="flex gap-2">
          <Link
            to="/dashboard/charts/create"
            search={{ symbol: snapshot.symbol }}
            className="inline-flex items-center gap-2"
          >
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              New Snapshot
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  snapshot for {snapshot.symbol} and all associated chart
                  images.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" orientation="vertical" className="flex">
        <TabsList className="flex flex-col h-[calc(100vh-200px)] sticky top-6 w-48 space-y-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {TIMEFRAME_ORDER.map((timeframe) => {
            const screenshot = sortedScreenshots.find(
              (s) => s.timeframe === timeframe
            );
            if (!screenshot) return null;
            return (
              <TabsTrigger key={timeframe} value={timeframe}>
                {timeframe}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 pl-6">
          <TabsContent value="overview">
            <Card className="p-6">
              {snapshot.notes && <Markdown>{snapshot.notes}</Markdown>}
            </Card>
          </TabsContent>

          {TIMEFRAME_ORDER.map((timeframe) => {
            const screenshot = sortedScreenshots.find(
              (s) => s.timeframe === timeframe
            );
            if (!screenshot) return null;
            return (
              <TabsContent key={timeframe} value={timeframe}>
                <div className="space-y-6">
                  <Tabs
                    value={selectedView}
                    onValueChange={(value) =>
                      setSelectedView(value as "chart" | "analysis")
                    }
                    className="w-full"
                  >
                    <TabsList>
                      <TabsTrigger value="chart">Chart</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart">
                      <Card className="p-4">
                        <div className="aspect-video relative overflow-hidden rounded-md">
                          <img
                            src={getStorageUrl(screenshot.fileKey)}
                            alt={`Chart snapshot for ${snapshot.symbol}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="analysis">
                      <AnalysisCard screenshot={screenshot} />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
