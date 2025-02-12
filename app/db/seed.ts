import "dotenv/config";

import { database } from "./index";
import { accounts, profiles, users } from "~/db/schema";
import { courses, segments } from "./schema";

async function main() {
  const [user] = await database
    .insert(users)
    .values({
      email: "testing@example.com",
      emailVerified: undefined,
    })
    .onConflictDoNothing()
    .returning();

  const [account] = await database
    .insert(accounts)
    .values({
      googleId: undefined,
      userId: user.id,
    })
    .onConflictDoNothing()
    .returning();

  const [profile] = await database
    .insert(profiles)
    .values({
      userId: user.id,
      displayName: "Test User",
    })
    .onConflictDoNothing()
    .returning();
}

async function seed() {
  // Create a test user
  const [user] = await database
    .insert(users)
    .values({
      email: "test@example.com",
    })
    .returning();

  // Create a course
  const [course] = await database
    .insert(courses)
    .values({
      userId: user.id,
      title: "Introduction to TypeScript",
      category: "Programming",
    })
    .returning();

  // Create 5 segments for the course
  const segmentsData = [
    {
      courseId: course.id,
      title: "TypeScript Basics",
      content:
        "Learn the basics of TypeScript including types, interfaces, and classes.",
      order: 1,
    },
    {
      courseId: course.id,
      title: "Advanced Types",
      content:
        "Explore advanced TypeScript types like unions, intersections, and generics.",
      order: 2,
    },
    {
      courseId: course.id,
      title: "TypeScript with React",
      content: "Learn how to use TypeScript with React components and hooks.",
      order: 3,
    },
    {
      courseId: course.id,
      title: "State Management",
      content: "Implement state management in TypeScript applications.",
      order: 4,
    },
    {
      courseId: course.id,
      title: "Testing TypeScript Code",
      content: "Learn how to write tests for TypeScript applications.",
      order: 5,
    },
  ];

  await database.insert(segments).values(segmentsData);

  console.log("Database seeded!");
}

main();
seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
