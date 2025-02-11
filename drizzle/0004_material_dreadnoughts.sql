CREATE TABLE "app_course_bookmark" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"courseId" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_course_enrollment" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"courseId" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_segment_completion" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"courseId" serial NOT NULL,
	"segment_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_course_bookmark" ADD CONSTRAINT "app_course_bookmark_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_course_bookmark" ADD CONSTRAINT "app_course_bookmark_courseId_app_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."app_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_course_enrollment" ADD CONSTRAINT "app_course_enrollment_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_course_enrollment" ADD CONSTRAINT "app_course_enrollment_courseId_app_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."app_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_segment_completion" ADD CONSTRAINT "app_segment_completion_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_segment_completion" ADD CONSTRAINT "app_segment_completion_courseId_app_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."app_course"("id") ON DELETE cascade ON UPDATE no action;