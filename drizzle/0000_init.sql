CREATE TABLE `gallery_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`src` text NOT NULL,
	`video` text,
	`cat` text NOT NULL,
	`title` text NOT NULL,
	`width` integer,
	`height` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tag` text NOT NULL,
	`main` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`phone_label` text NOT NULL,
	`phone_display` text NOT NULL,
	`phone_number` text NOT NULL,
	`opens` text DEFAULT '' NOT NULL,
	`maps` text DEFAULT '' NOT NULL,
	`locality` text DEFAULT '' NOT NULL,
	`region` text DEFAULT '' NOT NULL,
	`postal_code` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`mime` text NOT NULL,
	`data` blob NOT NULL,
	`width` integer,
	`height` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`image` text NOT NULL,
	`alt` text DEFAULT '' NOT NULL,
	`href` text DEFAULT '#galeri' NOT NULL,
	`layout` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
