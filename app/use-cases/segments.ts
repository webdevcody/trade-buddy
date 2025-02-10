import { Course } from "~/db/schema";

export interface Segment {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  assignments: string[];
}

const segments: Segment[] = Array.from({ length: 20 }, (_, i) => {
  const titles = [
    "Adding Numbers Up to 10",
    "Subtracting Numbers Up to 10",
    "Counting by 2s and 5s",
    "Introduction to Place Value",
    "Greater Than and Less Than Value Value Value Value",
    "Basic Shapes and Patterns",
    "Adding Three Numbers",
    "Number Bonds to 10",
    "Skip Counting to 100",
    "Telling Time to the Hour",
    "Measuring with Units",
    "Introduction to Money",
    "Adding Numbers Up to 20",
    "Subtracting Numbers Up to 20",
    "2D and 3D Shapes",
    "Simple Word Problems",
    "Even and Odd Numbers",
    "Making Groups of Ten",
    "Number Patterns",
    "Math Facts Practice",
  ];
  return {
    id: String(i + 1),
    title: titles[i],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    content: `This is the content for ${titles[i]}`,
    assignments: ["Assignment 1", "Assignment 2"],
    courseId: "1",
  };
});

export async function getSegmentsUseCase(courseId: Course["id"]) {
  return segments;
}

export async function getSegmentUseCase(segmentId: string) {
  const segment = segments.find((s) => s.id === segmentId);
  if (!segment) {
    throw new Error(`Segment with id ${segmentId} not found`);
  }
  return segment;
}
