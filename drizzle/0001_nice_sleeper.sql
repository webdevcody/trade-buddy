ALTER TABLE "app_chart_screenshot" ADD COLUMN "analysis" text;--> statement-breakpoint
ALTER TABLE "app_chart_screenshot" ADD COLUMN "recommendation" text;--> statement-breakpoint
ALTER TABLE "app_chart_screenshot" ADD COLUMN "confidence" integer;--> statement-breakpoint
ALTER TABLE "app_chart_screenshot" ADD COLUMN "patterns" text[];