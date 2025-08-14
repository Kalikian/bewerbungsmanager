CREATE TYPE "public"."application_status" AS ENUM('open', 'applied', 'interview', 'rejected', 'offer', 'contract', 'withdrawn');--> statement-breakpoint
CREATE TABLE "application" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"job_title" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"contact_name" varchar(200),
	"contact_email" varchar(320),
	"contact_phone" varchar(50),
	"address" varchar(300),
	"job_source" varchar(200),
	"job_url" varchar(1000),
	"salary" numeric(12, 2),
	"work_model" varchar(50),
	"start_date" date,
	"application_deadline" date,
	"status" "application_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"filename_original" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_key" text NOT NULL,
	"checksum_sha256" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "note" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"date" date DEFAULT CURRENT_DATE NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "timeline" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"date" date DEFAULT CURRENT_DATE,
	"event" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "timeline" ADD CONSTRAINT "timeline_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "application_user_idx" ON "application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "attachment_app_idx" ON "attachment" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "note_app_idx" ON "note" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "timeline_app_idx" ON "timeline" USING btree ("application_id");