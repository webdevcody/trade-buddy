CREATE TABLE "app_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"googleId" text,
	CONSTRAINT "app_accounts_googleId_unique" UNIQUE("googleId")
);
--> statement-breakpoint
CREATE TABLE "app_chart_screenshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshotId" serial NOT NULL,
	"fileKey" text NOT NULL,
	"timeframe" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_chart_snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"symbol" text NOT NULL,
	"timeframe" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"displayName" text,
	"imageId" text,
	"image" text,
	"bio" text DEFAULT '' NOT NULL,
	CONSTRAINT "app_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "app_session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"emailVerified" timestamp,
	CONSTRAINT "app_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "app_accounts" ADD CONSTRAINT "app_accounts_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_chart_screenshot" ADD CONSTRAINT "app_chart_screenshot_snapshotId_app_chart_snapshot_id_fk" FOREIGN KEY ("snapshotId") REFERENCES "public"."app_chart_snapshot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_chart_snapshot" ADD CONSTRAINT "app_chart_snapshot_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_profile" ADD CONSTRAINT "app_profile_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_session" ADD CONSTRAINT "app_session_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_google_id_idx" ON "app_accounts" USING btree ("userId","googleId");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "app_session" USING btree ("userId");