import { Link, useNavigate } from "@tanstack/react-router";
import { TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Course } from "~/db/schema";

export function CourseCard({ course }: { course: Course }) {
  const router = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">{course.title}</CardTitle>
        <CardDescription>{course.category}</CardDescription>
      </CardHeader>
      {/* <CardContent>
        <p>{exercise.reps} reps</p>
        <p>{exercise.sets} sets</p>
      </CardContent> */}
      <CardFooter>
        <Link to={`/courses/${course.id}`}>
          <Button>View</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
