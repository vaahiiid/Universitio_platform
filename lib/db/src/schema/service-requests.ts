import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  preferredContact: text("preferred_contact"),
  howDidYouHear: text("how_did_you_hear"),
  studyLevel: text("study_level"),
  currentEducation: text("current_education"),
  fieldOfStudy: text("field_of_study"),
  targetScore: text("target_score"),
  interviewType: text("interview_type"),
  universityName: text("university_name"),
  universities: text("universities"),
  programme: text("programme"),
  serviceNeeded: text("service_needed"),
  city: text("city"),
  intakeTerm: text("intake_term"),
  year: text("year"),
  budget: text("budget"),
  arrivalAirport: text("arrival_airport"),
  destinationCity: text("destination_city"),
  passengers: text("passengers"),
  notes: text("notes"),
  marketingOptOut: boolean("marketing_opt_out").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  consentVersion: text("consent_version").default("v1.0"),
  status: text("status").notNull().default("New"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = typeof serviceRequests.$inferInsert;
