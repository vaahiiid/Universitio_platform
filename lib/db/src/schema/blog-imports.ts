import { pgTable, serial, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const blogImportRecords = pgTable("blog_import_records", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  postCount: integer("post_count").notNull().default(0),
  imageCount: integer("image_count").notNull().default(0),
  importData: jsonb("import_data"),
  importedBy: text("imported_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogImportRecord = typeof blogImportRecords.$inferSelect;
export type InsertBlogImportRecord = typeof blogImportRecords.$inferInsert;
