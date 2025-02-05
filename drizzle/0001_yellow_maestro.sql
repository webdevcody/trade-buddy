CREATE TABLE "app_exercise" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"exercise" text NOT NULL,
	"weight" integer NOT NULL,
	"reps" integer NOT NULL,
	"sets" integer NOT NULL,
	CONSTRAINT "app_exercise_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "app_exercise" ADD CONSTRAINT "app_exercise_userId_app_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;