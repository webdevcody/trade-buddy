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
  description: text("description").notNull(),
  category: text("category").notNull(),
  videoKey: text("videoKey"),
});

export const segments = tableCreator("segment", {
  id: serial("id").primaryKey(),
  courseId: serial("courseId")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  videoKey: text("videoKey"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const attachments = tableCreator("attachment", {
  id: serial("id").primaryKey(),
  segmentId: serial("segmentId")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  fileName: text("fileName").notNull(),
  fileKey: text("fileKey").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  segments: many(segments),
}));

export const segmentsRelations = relations(segments, ({ one, many }) => ({
  course: one(courses, {
    fields: [segments.courseId],
    references: [courses.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  segment: one(segments, {
    fields: [attachments.segmentId],
    references: [segments.id],
  }),
}));

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
export type CourseUpdate = Partial<typeof courses.$inferInsert>;
export type CourseBookmark = typeof courseBookmarks.$inferSelect;
export type CourseBookmarkInsert = typeof courseBookmarks.$inferInsert;
export type Segment = typeof segments.$inferSelect;
export type SegmentCreate = typeof segments.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type AttachmentCreate = typeof attachments.$inferInsert;
