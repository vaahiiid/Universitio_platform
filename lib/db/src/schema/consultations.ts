import { pgTable, serial, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  dateOfBirth: text("date_of_birth"),
  nationality: text("nationality"),
  maritalStatus: text("marital_status"),
  preferredDestinations: jsonb("preferred_destinations").$type<string[]>(),
  intendedCourseArea: text("intended_course_area"),
  intendedStudyLevel: text("intended_study_level"),
  previousEducation: jsonb("previous_education").$type<Array<{ fieldOfStudy: string; levelOfStudy: string }>>(),
  hasEnglishQualification: text("has_english_qualification"),
  englishQualificationType: text("english_qualification_type"),
  englishOverallScore: text("english_overall_score"),
  englishCurrentLevel: text("english_current_level"),
  tuitionBudget: text("tuition_budget"),
  preferredContactMethod: text("preferred_contact_method"),
  howDidYouHear: text("how_did_you_hear"),
  cvFileName: text("cv_file_name"),
  rawData: jsonb("raw_data"),
  marketingOptOut: boolean("marketing_opt_out").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  consentVersion: text("consent_version").default("v1.0"),
  status: text("status").notNull().default("New"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;
