import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const studentReferrals = pgTable("student_referrals", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  dateOfBirth: text("date_of_birth"),
  university: text("university"),
  studentNationalities: jsonb("student_nationalities").$type<string[]>(),
  destinations: jsonb("destinations").$type<string[]>(),
  additionalNotes: text("additional_notes"),
  rawData: jsonb("raw_data"),
  status: text("status").notNull().default("New"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StudentReferral = typeof studentReferrals.$inferSelect;
export type InsertStudentReferral = typeof studentReferrals.$inferInsert;
