CREATE TABLE "app_course" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_course" ADD CONSTRAINT "app_course_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;