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

export const chartSnapshots = tableCreator("chart_snapshot", {
  id: serial("id").primaryKey(),
  userId: serial("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(), // e.g., '1m', '5m', '1h', '1d'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chartScreenshots = tableCreator("chart_screenshot", {
  id: serial("id").primaryKey(),
  snapshotId: serial("snapshotId")
    .notNull()
    .references(() => chartSnapshots.id, { onDelete: "cascade" }),
  fileKey: text("fileKey").notNull(),
  timeframe: text("timeframe").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chartSnapshotsRelations = relations(
  chartSnapshots,
  ({ many }) => ({
    screenshots: many(chartScreenshots),
  })
);

export const chartScreenshotsRelations = relations(
  chartScreenshots,
  ({ one }) => ({
    snapshot: one(chartSnapshots, {
      fields: [chartScreenshots.snapshotId],
      references: [chartSnapshots.id],
    }),
  })
);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ChartSnapshot = typeof chartSnapshots.$inferSelect;
export type ChartSnapshotCreate = typeof chartSnapshots.$inferInsert;
export type ChartScreenshot = typeof chartScreenshots.$inferSelect;
export type ChartScreenshotCreate = typeof chartScreenshots.$inferInsert;
