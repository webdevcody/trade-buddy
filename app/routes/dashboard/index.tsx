import { createFileRoute } from "@tanstack/react-router";
import { database as db } from "~/db";
import { desc, eq } from "drizzle-orm";
import { chartSnapshots, chartScreenshots } from "~/db/schema";
import { format } from "date-fns";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import type { ChartSnapshot, ChartScreenshot } from "~/db/schema";
import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { Link } from "@tanstack/react-router";
import { getStorageUrl } from "~/utils/storage";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

type LoaderData = {
  snapshots: {
    chart_snapshot: ChartSnapshot;
    chart_screenshot: ChartScreenshot | null;
  }[];
};

type SnapshotData = LoaderData["snapshots"][0];

const getSnapshotsFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .handler(async () => {
    const data = await db
      .select()
      .from(chartSnapshots)
      .leftJoin(
        chartScreenshots,
        eq(chartSnapshots.id, chartScreenshots.snapshotId)
      )
      .orderBy(desc(chartSnapshots.createdAt));
    return data;
  });

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const data = await getSnapshotsFn();
    return { snapshots: data } as LoaderData;
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { snapshots: allSnapshots } = Route.useLoaderData();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Transform unique symbols into the format expected by the combobox
  const symbols = Array.from(
    new Set(
      allSnapshots.map(
        (snapshot: SnapshotData) => snapshot.chart_snapshot.symbol
      )
    )
  ).map((symbol) => ({
    value: symbol.toLowerCase(),
    label: symbol,
  }));

  // Filter snapshots based on selected symbol
  const filteredSnapshots = value
    ? allSnapshots.filter(
        (snapshot: SnapshotData) =>
          snapshot.chart_snapshot.symbol.toLowerCase() === value
      )
    : allSnapshots;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Stock History</h1>
        <Link to="/dashboard/charts/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Snapshot
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
            >
              {value
                ? symbols.find((symbol) => symbol.value === value)?.label
                : "Select symbol..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {symbols.map((symbol) => (
                    <CommandItem
                      key={symbol.value}
                      value={symbol.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      {symbol.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === symbol.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSnapshots.map((snapshot: SnapshotData) => (
          <Link
            key={snapshot.chart_snapshot.id}
            to="/dashboard/charts/$snapshotId"
            params={{ snapshotId: snapshot.chart_snapshot.id.toString() }}
            className={cn(
              "block border rounded-lg p-4 transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "active:translate-y-0.5"
            )}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">
                {snapshot.chart_snapshot.symbol}
              </h3>
              <span className="text-sm text-gray-500">
                {format(
                  new Date(snapshot.chart_snapshot.createdAt),
                  "MMM d, yyyy h:mm a"
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {snapshot.chart_screenshot && (
                <div className="space-y-2">
                  <img
                    src={getStorageUrl(snapshot.chart_screenshot.fileKey)}
                    alt={`Chart for ${snapshot.chart_snapshot.symbol}`}
                    className="w-full h-auto rounded"
                  />
                  <div className="text-sm text-gray-600">
                    {snapshot.chart_screenshot.timeframe}
                  </div>
                  {snapshot.chart_screenshot.analysis && (
                    <div className="text-sm">
                      <div className="font-medium">Analysis:</div>
                      <div>{snapshot.chart_screenshot.recommendation}</div>
                      <div className="text-gray-500">
                        Confidence: {snapshot.chart_screenshot.confidence}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
