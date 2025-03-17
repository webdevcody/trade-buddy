import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";

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
  if (
    !screenshot.analysis ||
    !screenshot.recommendation ||
    !screenshot.confidence
  ) {
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

  const placeholderAnalysis = `
## Technical Analysis

The stock is showing a **bullish trend** with the following key points:

- Strong support level at $XX.XX
- Moving averages indicate upward momentum
- Volume increasing on up days

### Key Levels
- Resistance: $XX.XX
- Support: $XX.XX

### Recommendation
Consider watching for a breakout above resistance level.
`;

  const overviewAnalysis = `
## Overall Market Analysis for ${snapshot.symbol}

### Multi-Timeframe Analysis Summary

${snapshot.screenshots.map((s) => `**${s.timeframe}**: Showing bullish momentum with key support at $XX.XX`).join("\n")}

### Pattern Recognition
- Double bottom formation on daily chart
- Bullish engulfing on 4H timeframe
- RSI showing oversold conditions on lower timeframes

### Volume Analysis
- Increasing volume on upward movements
- Decreasing volume on pullbacks
- Above average volume in recent sessions

### Key Action Points
1. Primary trend is **bullish** across multiple timeframes
2. Major resistance levels:
   - R1: $XX.XX
   - R2: $XX.XX
3. Major support levels:
   - S1: $XX.XX
   - S2: $XX.XX

### Trading Opportunities
- Look for pullbacks to support levels for potential entries
- Consider breakout trades above major resistance
- Keep stops below key support levels

### Risk Management
- Suggested stop loss: Below $XX.XX
- Position sizing: 2% risk per trade
- Multiple timeframe confirmation recommended
`;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{snapshot.symbol}</h1>
        </div>

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
                snapshot for {snapshot.symbol} and all associated chart images.
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
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
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <img
                      src={getStorageUrl(screenshot.fileKey)}
                      alt={`Chart snapshot for ${snapshot.symbol}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </Card>
                <AnalysisCard screenshot={screenshot} />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
