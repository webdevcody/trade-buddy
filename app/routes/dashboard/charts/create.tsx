import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { assertAuthenticatedFn } from "~/fn/auth";
import { createSnapshotUseCase } from "~/use-cases/snapshots";
import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Label } from "~/components/ui/label";
import { getPresignedPostUrlFn } from "~/fn/storage";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { analyzeChartsWithAIFn } from "~/fn/analysis";
import { getStorageUrl } from "~/utils/storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useDropzone } from "react-dropzone";

interface TimeframeImage {
  file: File;
  previewUrl: string;
  imageId: string;
  analysis?: {
    recommendation: "LONG" | "SHORT" | "WAIT";
    confidence: number;
    analysis: string;
    patterns: string[];
  };
}

const createSnapshotSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
  notes: z.string().optional(),
  images: z
    .array(
      z.object({
        timeframe: z.string(),
        imageId: z.string(),
        analysis: z
          .object({
            recommendation: z.enum(["LONG", "SHORT", "WAIT"]),
            confidence: z.number(),
            analysis: z.string(),
            patterns: z.array(z.string()),
          })
          .optional(),
      })
    )
    .min(1, "At least one image is required"),
});

type FormData = z.infer<typeof createSnapshotSchema>;

const createSnapshotFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(createSnapshotSchema)
  .handler(
    async ({
      context,
      data,
    }: {
      context: { userId: number };
      data: FormData;
    }) => {
      const snapshot = await createSnapshotUseCase(context.userId, data);
      return snapshot;
    }
  );

export const Route = createFileRoute("/dashboard/charts/create")({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      symbol: search.symbol as string | undefined,
    };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { symbol } = Route.useSearch();
  const [timeframeImages, setTimeframeImages] = useState<
    Record<string, TimeframeImage>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createSnapshotSchema),
    defaultValues: {
      symbol: symbol || "",
      timeframe: "1m",
      notes: "",
      images: [],
    },
  });

  // Update form when search params change
  useEffect(() => {
    if (symbol) {
      form.setValue("symbol", symbol);
    }
  }, [symbol, form]);

  // Update form images field when timeframeImages changes
  useEffect(() => {
    const images = Object.entries(timeframeImages).map(
      ([timeframe, { imageId }]) => ({
        timeframe,
        imageId,
      })
    );
    form.setValue("images", images);
  }, [timeframeImages, form]);

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timeframeImages).forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, []);

  const timeframes = [
    { value: "1m", label: "1 minute" },
    { value: "5m", label: "5 minutes" },
    { value: "15m", label: "15 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "4h", label: "4 hours" },
    { value: "1d", label: "1 day" },
  ];

  const handleImageUpload = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const timeframe = form.getValues("timeframe");
        // Clean up previous preview URL for this timeframe if it exists
        if (timeframeImages[timeframe]?.previewUrl) {
          URL.revokeObjectURL(timeframeImages[timeframe].previewUrl);
        }

        const presignedData = await getPresignedPostUrlFn({
          data: {
            contentType: file.type,
          },
        });

        const previewUrl = URL.createObjectURL(file);

        setTimeframeImages((prev) => ({
          ...prev,
          [timeframe]: {
            file,
            previewUrl,
            imageId: presignedData.key,
          },
        }));

        return presignedData.key;
      } catch (error) {
        console.error("Failed to get upload URL:", error);
        return null;
      }
    }
    return null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: handleImageUpload,
    maxFiles: 1,
  });

  async function onSubmit(formData: FormData) {
    try {
      setIsAnalyzing(true);
      const images: {
        timeframe: string;
        imageId: string;
        analysis?: {
          recommendation: "LONG" | "SHORT" | "WAIT";
          confidence: number;
          analysis: string;
          patterns: string[];
        };
      }[] = [];

      // Upload all images and collect their IDs
      await Promise.all(
        Object.entries(timeframeImages).map(
          async ([timeframe, { file, imageId }]) => {
            const presignedData = await getPresignedPostUrlFn({
              data: {
                contentType: file.type,
              },
            });

            const uploadFormData = new FormData();
            Object.entries(presignedData.fields).forEach(([key, value]) => {
              uploadFormData.append(key, value);
            });
            uploadFormData.append("file", file);

            await fetch(presignedData.url, {
              method: "POST",
              body: uploadFormData,
            });

            // Analyze each timeframe individually
            const timeframeAnalysis = await analyzeChartsWithAIFn({
              data: {
                symbol: formData.symbol,
                images: [{ timeframe, imageId: presignedData.key }],
              },
            });

            images.push({
              timeframe,
              imageId: presignedData.key,
              analysis: {
                ...timeframeAnalysis,
                recommendation: timeframeAnalysis.recommendation || "WAIT",
                confidence: timeframeAnalysis.confidence || 0,
              },
            });
          }
        )
      );

      // Analyze all images together for the overview
      const overallAnalysis = await analyzeChartsWithAIFn({
        data: {
          symbol: formData.symbol,
          images: images.map(({ timeframe, imageId }) => ({
            timeframe,
            imageId,
          })),
        },
      });

      // Create the snapshot with both individual and overall analysis
      const snapshot = await createSnapshotFn({
        data: {
          symbol: formData.symbol,
          timeframe: formData.timeframe,
          notes: formData.notes
            ? `${formData.notes}\n\nOverall AI Analysis:\n${overallAnalysis.analysis}`
            : `Overall AI Analysis:\n${overallAnalysis.analysis}`,
          images: images,
        },
      });

      navigate({ to: `/dashboard/charts/${snapshot!.id}` });
    } catch (error) {
      console.error("Failed to create snapshot:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="flex-grow p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Chart Snapshot</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="BTC/USD" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the trading pair or symbol (e.g., BTC/USD, AAPL)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel>Chart Images</FormLabel>
                <FormControl>
                  <Tabs
                    defaultValue={form.getValues("timeframe")}
                    onValueChange={(value) => form.setValue("timeframe", value)}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                      {timeframes.map((tf) => (
                        <TabsTrigger
                          key={tf.value}
                          value={tf.value}
                          className="relative"
                        >
                          {tf.label}
                          {timeframeImages[tf.value] && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 absolute -top-1 -right-1 z-10" />
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {timeframes.map((tf) => (
                      <TabsContent key={tf.value} value={tf.value}>
                        <div className="space-y-4">
                          {timeframeImages[tf.value] ? (
                            <div className="space-y-4">
                              <img
                                src={timeframeImages[tf.value].previewUrl}
                                alt={`Preview for ${tf.value}`}
                                className="max-w-full h-auto rounded-lg border"
                              />
                              <div
                                {...getRootProps()}
                                className={cn(
                                  "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer",
                                  "hover:border-primary/50 transition-colors",
                                  isDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-muted"
                                )}
                              >
                                <input {...getInputProps()} />
                                <p>
                                  Drop a new image to replace, or click to
                                  select
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div
                              {...getRootProps()}
                              className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
                                "hover:border-primary/50 transition-colors",
                                isDragActive
                                  ? "border-primary bg-primary/5"
                                  : "border-muted"
                              )}
                            >
                              <input {...getInputProps()} />
                              <p>
                                Drag & drop chart images here, or click to
                                select files
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </FormControl>
                <FormDescription>
                  Upload at least one chart image for any timeframe
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any notes about this chart snapshot..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional notes about your analysis, observations, or trade
                  setup
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Create Snapshot"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
