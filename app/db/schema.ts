import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const PREFIX = "app";

const tableCreator = pgTableCreator((name) => `${PREFIX}_${name}`);

export const users = tableCreator("user", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
});

export const accounts = tableCreator(
  "accounts",
  {
    id: serial("id").primaryKey(),
    userId: serial("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    googleId: text("googleId").unique(),
  },
  (table) => ({
    userIdGoogleIdIdx: index("user_id_google_id_idx").on(
      table.userId,
      table.googleId
    ),
  })
);

export const profiles = tableCreator("profile", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  imageId: text("imageId"),
  image: text("image"),
  bio: text("bio").notNull().default(""),
});

export const sessions = tableCreator(
  "session",
  {
    id: text("id").primaryKey(),
    userId: serial("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  })
);

export const exercises = tableCreator("exercise", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exercise: text("exercise").notNull(),
  weight: integer("weight").notNull(),
  reps: integer("reps").notNull(),
  sets: integer("sets").notNull(),
});

export const courses = tableCreator("course", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
});

export const courseBookmarks = tableCreator("bookmark", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: serial("courseId")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courseBookmarksRelations = relations(
  courseBookmarks,
  ({ one }) => ({
    course: one(courses, {
      fields: [courseBookmarks.courseId],
      references: [courses.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseCreate = typeof exercises.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type CourseCreate = typeof courses.$inferInsert;
export type CourseBookmark = typeof courseBookmarks.$inferSelect;
export type CourseBookmarkInsert = typeof courseBookmarks.$inferInsert;
