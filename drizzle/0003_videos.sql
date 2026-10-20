CREATE TABLE `video_chunks` (
	`video_id` text NOT NULL,
	`idx` integer NOT NULL,
	`data` blob NOT NULL,
	PRIMARY KEY(`video_id`, `idx`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
