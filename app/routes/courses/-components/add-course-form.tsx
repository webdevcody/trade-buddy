import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { createServerFn } from "@tanstack/start";
import { createExerciseUseCase } from "~/use-cases/exercises";
import { authenticatedMiddleware } from "~/lib/auth";
import { createCourseUseCase } from "~/use-cases/courses";
import { useNavigate } from "@tanstack/react-router";

const formSchema = z.object({
  title: z.string().min(2).max(50),
  category: z.string().min(2).max(50),
});

const createCourseFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(formSchema)
  .handler(async ({ data, context }) => {
    return await createCourseUseCase(context.userId, data);
  });

export function AddCourseForm() {
  const router = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCourseFn({ data: values }).then((course) => {
      router({ to: `/courses/${course.id}` });
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Algebra 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Math, Science, etc.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Create Course</Button>
        </form>
      </Form>
    </div>
  );
}
