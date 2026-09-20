CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`topic` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`sales_note` text DEFAULT '' NOT NULL,
	`updated_by` text,
	`revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_request_key_unique` ON `inquiries` (`request_key`);--> statement-breakpoint
CREATE INDEX `inquiries_created_idx` ON `inquiries` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `inquiries_status_created_idx` ON `inquiries` (`status`,`created_at`,`id`);