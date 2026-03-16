import { pgTable, serial, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const partnerRequests = pgTable("partner_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  position: text("position"),
  organisation: text("organisation"),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  services: text("services"),
  studentNationalities: jsonb("student_nationalities").$type<string[]>(),
  country: text("country"),
  destinations: jsonb("destinations").$type<string[]>(),
  additionalNotes: text("additional_notes"),
  rawData: jsonb("raw_data"),
  marketingOptOut: boolean("marketing_opt_out").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  consentVersion: text("consent_version").default("v1.0"),
  status: text("status").notNull().default("New"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PartnerRequest = typeof partnerRequests.$inferSelect;
export type InsertPartnerRequest = typeof partnerRequests.$inferInsert;
