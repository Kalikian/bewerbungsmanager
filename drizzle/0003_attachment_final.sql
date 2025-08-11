ALTER TABLE "attachment" DROP CONSTRAINT "attachment_application_id_application_id_fk";
--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "application_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "filename_original" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "mime_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "size_bytes" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "storage_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "checksum_sha256" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "url";