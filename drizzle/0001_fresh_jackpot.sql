ALTER TABLE "note" ALTER COLUMN "application_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "updated_at" timestamp;