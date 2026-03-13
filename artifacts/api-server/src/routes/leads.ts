import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  consultations,
  assessments,
  partnerRequests,
  studentReferrals,
} from "@workspace/db";
import type { InsertConsultation } from "@workspace/db";
import type { InsertAssessment } from "@workspace/db";
import type { InsertPartnerRequest } from "@workspace/db";
import type { InsertStudentReferral } from "@workspace/db";
import { computeScores, type AssessmentProfile } from "../lib/assessmentScoring";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const CV_UPLOAD_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../uploads/cvs");
if (!fs.existsSync(CV_UPLOAD_DIR)) {
  fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}

const cvUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, CV_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

function tryParseJson(val: unknown): unknown {
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

function normaliseBody(data: Record<string, unknown>): Record<string, unknown> {
  const jsonFields = [
    "preferredDestinations", "previousEducation", "destinations",
    "additionalStrengths", "studentNationalities", "nationalities",
  ];
  const result = { ...data };
  for (const field of jsonFields) {
    if (result[field] !== undefined) {
      result[field] = tryParseJson(result[field]);
    }
  }
  return result;
}

function validateRequired(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const val = data[field];
    if (!val || (typeof val === "string" && !val.trim())) {
      return `${field} is required`;
    }
  }
  return null;
}

function toBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "yes" || val === "true";
  return false;
}

router.post("/leads/consultation", cvUpload.single("cvFile"), async (req: Request, res: Response) => {
  try {
    const data = normaliseBody(req.body as Record<string, unknown>);
    const err = validateRequired(data, ["fullName", "email", "mobile"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const cvFileName = req.file ? req.file.filename : (data.cvFileName as string | undefined) || null;

    const intendedCourseArea = data.intendedCourseArea === "Other"
      ? (data.intendedCourseAreaOther as string) || (data.intendedCourseArea as string)
      : (data.intendedCourseArea as string);

    const englishQualificationType = data.englishQualificationType === "Other"
      ? (data.englishQualificationTypeOther as string) || (data.englishQualificationType as string)
      : (data.englishQualificationType as string);

    const howDidYouHear = data.howDidYouHear === "Other"
      ? (data.howDidYouHearOther as string) || (data.howDidYouHear as string)
      : (data.howDidYouHear as string);

    const values: InsertConsultation = {
      fullName: data.fullName as string,
      email: data.email as string,
      mobile: data.mobile as string,
      dateOfBirth: data.dateOfBirth as string,
      nationality: data.nationality as string,
      maritalStatus: data.maritalStatus as string,
      preferredDestinations: data.preferredDestinations as string[],
      intendedCourseArea,
      previousEducation: data.previousEducation as Array<{ fieldOfStudy: string; levelOfStudy: string }>,
      hasEnglishQualification: data.hasEnglishQualification as string,
      englishQualificationType,
      englishOverallScore: data.englishOverallScore as string,
      englishCurrentLevel: data.englishCurrentLevel as string,
      tuitionBudget: data.tuitionBudget as string,
      preferredContactMethod: data.preferredContactMethod as string,
      howDidYouHear,
      cvFileName,
      rawData: data,
      status: "New",
    };

    const [row] = await db.insert(consultations).values(values).returning();
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("Error saving consultation:", err);
    res.status(500).json({ error: "Failed to save consultation" });
  }
});

router.post("/leads/assessment", cvUpload.single("cvFile"), async (req: Request, res: Response) => {
  try {
    const data = normaliseBody(req.body as Record<string, unknown>);
    const err = validateRequired(data, ["fullName", "email", "mobile"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const cvFileName = req.file ? req.file.filename : (data.cvFileName as string | undefined) || null;

    const hasLangQual = toBool(data.hasLanguageQualification);
    const hasResearch = toBool(data.hasResearchExperience);

    const profile: AssessmentProfile = {
      dateOfBirth: (data.dateOfBirth as string) || "",
      nationality: (data.nationality as string) || "",
      maritalStatus: (data.maritalStatus as string) || "",
      destinations: (data.destinations as string[]) || [],
      studyLevel: (data.studyLevel as string) || "",
      courseArea: (data.courseArea as string) || "",
      highestQualification: (data.highestQualification as string) || "",
      academicPerformance: (data.academicPerformance as string) || "",
      fieldAlignment: (data.fieldAlignment as string) || "",
      hasLanguageQualification: hasLangQual,
      languageQualificationType: data.languageQualificationType as string | undefined,
      languageScore: data.languageScore as string | undefined,
      englishLevel: data.englishLevel as string | undefined,
      budget: (data.budget as string) || "",
      additionalStrengths: (data.additionalStrengths as string[]) || [],
      hasResearchExperience: hasResearch,
    };

    const destinationScores = computeScores(profile);
    const bestScore = destinationScores.reduce(
      (best, ds) => (ds.score > best.score ? ds : best),
      destinationScores[0] || { score: 0, band: "N/A" },
    );

    const scoreNotes = destinationScores
      .map((ds) => `${ds.destination}: ${ds.score}/100 (${ds.band})`)
      .join("; ");

    const values: InsertAssessment = {
      fullName: data.fullName as string,
      email: data.email as string,
      mobile: data.mobile as string,
      dateOfBirth: data.dateOfBirth as string,
      nationality: data.nationality as string,
      maritalStatus: data.maritalStatus as string,
      destinations: data.destinations as string[],
      studyLevel: data.studyLevel as string,
      courseArea: data.courseArea as string,
      highestQualification: data.highestQualification as string,
      academicPerformance: data.academicPerformance as string,
      fieldAlignment: data.fieldAlignment as string,
      previousEducation: data.previousEducation as Record<string, unknown>,
      hasLanguageQualification: hasLangQual,
      languageQualificationType: data.languageQualificationType as string,
      languageScore: data.languageScore as string,
      englishLevel: data.englishLevel as string,
      budget: data.budget as string,
      additionalStrengths: data.additionalStrengths as string[],
      hasResearchExperience: hasResearch,
      preferredContactMethod: data.preferredContactMethod as string,
      howDidYouHear: data.howDidYouHear as string,
      cvFileName,
      overallScore: bestScore.score,
      scoreBand: bestScore.band,
      scoreNotes,
      followUpRequested: toBool(data.followUpRequested),
      rawData: data,
      status: "New",
    };

    const [row] = await db.insert(assessments).values(values).returning();
    res.status(201).json({ success: true, data: row, scores: destinationScores });
  } catch (err) {
    console.error("Error saving assessment:", err);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

router.post("/leads/partners", async (req: Request, res: Response) => {
  try {
    const data = normaliseBody(req.body as Record<string, unknown>);
    const err = validateRequired(data, ["fullName", "email"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const values: InsertPartnerRequest = {
      fullName: data.fullName as string,
      email: data.email as string,
      position: data.position as string,
      organisation: (data.organisationName ?? data.organisation) as string,
      phone: data.phone as string,
      website: data.website as string,
      services: (data.servicesDescription ?? data.services) as string,
      studentNationalities: (data.nationalities ?? data.studentNationalities) as string[],
      country: (data.basedIn ?? data.country) as string,
      destinations: data.destinations as string[],
      additionalNotes: (data.notes ?? data.additionalNotes) as string,
      rawData: data,
      status: "New",
    };

    const [row] = await db.insert(partnerRequests).values(values).returning();
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("Error saving partner request:", err);
    res.status(500).json({ error: "Failed to save partner request" });
  }
});

router.post("/leads/referral", async (req: Request, res: Response) => {
  try {
    const data = normaliseBody(req.body as Record<string, unknown>);
    const err = validateRequired(data, ["fullName", "email"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const values: InsertStudentReferral = {
      fullName: data.fullName as string,
      email: data.email as string,
      dateOfBirth: data.dateOfBirth as string,
      university: data.university as string,
      studentNationalities: (data.nationalities ?? data.studentNationalities) as string[],
      destinations: data.destinations as string[],
      additionalNotes: (data.notes ?? data.additionalNotes) as string,
      rawData: data,
      status: "New",
    };

    const [row] = await db.insert(studentReferrals).values(values).returning();
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("Error saving student referral:", err);
    res.status(500).json({ error: "Failed to save student referral" });
  }
});

export default router;
