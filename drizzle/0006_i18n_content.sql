ALTER TABLE `gallery_items` ADD `title_en` text;--> statement-breakpoint
ALTER TABLE `locations` ADD `tag_en` text;--> statement-breakpoint
ALTER TABLE `locations` ADD `phone_label_en` text;--> statement-breakpoint
ALTER TABLE `locations` ADD `opens_en` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `locale` text DEFAULT 'id' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `title_en` text;--> statement-breakpoint
ALTER TABLE `products` ADD `note_en` text;--> statement-breakpoint
ALTER TABLE `products` ADD `alt_en` text;