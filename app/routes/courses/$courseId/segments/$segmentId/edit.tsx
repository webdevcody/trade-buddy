import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { Title } from "~/components/title";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { authenticatedMiddleware } from "~/lib/auth";
import { isCourseAdminUseCase } from "~/use-cases/courses";
import { getSegmentUseCase, updateSegmentUseCase } from "~/use-cases/segments";
import { assertAuthenticatedFn } from "~/fn/auth";
import { ChevronLeft } from "lucide-react";
import { Container } from "~/routes/courses/-components/container";
import { v4 as uuidv4 } from "uuid";
import { getPresignedPostUrlFn } from "~/fn/storage";

function generateRandomUUID() {
  return uuidv4();
}

const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  video: z.instanceof(File).optional(),
});

const updateSegmentFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(
    z.object({
      segmentId: z.number(),
      data: z.object({
        title: z.string(),
        content: z.string(),
        videoKey: z.string().optional(),
      }),
    })
  )
  .handler(async ({ data, context }) => {
    const segment = await getSegmentUseCase(data.segmentId);
    if (!segment) throw new Error("Segment not found");

    const isAdmin = await isCourseAdminUseCase(
      context.userId,
      segment.courseId
    );
    if (!isAdmin) throw new Error("Not authorized");

    return await updateSegmentUseCase(data.segmentId, data.data);
  });

const loaderFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(z.object({ segmentId: z.number() }))
  .handler(async ({ data, context }) => {
    const segment = await getSegmentUseCase(data.segmentId);
    if (!segment) throw new Error("Segment not found");

    const isAdmin = await isCourseAdminUseCase(
      context.userId,
      segment.courseId
    );
    if (!isAdmin) throw new Error("Not authorized");

    return segment;
  });

export const Route = createFileRoute(
  "/courses/$courseId/segments/$segmentId/edit"
)({
  component: RouteComponent,
  beforeLoad: () => assertAuthenticatedFn(),
  loader: async ({ params, context }) => {
    const segment = await loaderFn({
      data: {
        segmentId: parseInt(params.segmentId),
      },
    });

    return segment;
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const courseId = parseInt(params.courseId);
  const segmentId = parseInt(params.segmentId);
  const segment = Route.useLoaderData();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: segment.title,
      content: segment.content,
      video: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let videoKey = undefined;
      if (values.video) {
        videoKey = generateRandomUUID();
        const presignedPost = await getPresignedPostUrlFn({
          data: {
            key: videoKey,
            contentType: values.video.type,
          },
        });

        const formData = new FormData();
        Object.entries(presignedPost.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", values.video);

        const uploadResponse = await fetch(presignedPost.url, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload video");
        }
      }

      await updateSegmentFn({
        data: {
          segmentId,
          data: {
            title: values.title,
            content: values.content,
            videoKey: videoKey,
          },
        },
      });

      // Navigate back to the segment
      navigate({
        to: "/courses/$courseId/segments/$segmentId",
        params: {
          courseId: courseId.toString(),
          segmentId: segmentId.toString(),
        },
      });
    } catch (error) {
      console.error("Failed to update segment:", error);
      // TODO: Show error toast
    }
  };

  return (
    <Container>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              to: "/courses/$courseId",
              params: { courseId: courseId.toString() },
            })
          }
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Course
        </Button>
      </div>

      <Title title="Edit Segment" />

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter segment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter segment content (supports markdown)"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Segment Video</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        onChange(e.target.files ? e.target.files[0] : undefined)
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a video file for your segment (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Update Segment</Button>
            </div>
          </form>
        </Form>
      </div>
    </Container>
  );
}
