import { Router, type IRouter } from "express";
import { db, consultations, assessments, partnerRequests, studentReferrals } from "@workspace/db";

const router: IRouter = Router();

function validateRequired(data: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && !data[field].trim())) {
      return `${field} is required`;
    }
  }
  return null;
}

router.post("/leads/consultation", async (req, res) => {
  try {
    const data = req.body;
    const err = validateRequired(data, ["fullName", "email", "mobile"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const [row] = await db.insert(consultations).values({
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      maritalStatus: data.maritalStatus,
      preferredDestinations: data.preferredDestinations,
      intendedCourseArea: data.intendedCourseArea === "Other" ? data.intendedCourseAreaOther || data.intendedCourseArea : data.intendedCourseArea,
      previousEducation: data.previousEducation,
      hasEnglishQualification: data.hasEnglishQualification,
      englishQualificationType: data.englishQualificationType === "Other" ? data.englishQualificationTypeOther || data.englishQualificationType : data.englishQualificationType,
      englishOverallScore: data.englishOverallScore,
      englishCurrentLevel: data.englishCurrentLevel,
      tuitionBudget: data.tuitionBudget,
      preferredContactMethod: data.preferredContactMethod,
      howDidYouHear: data.howDidYouHear === "Other" ? data.howDidYouHearOther || data.howDidYouHear : data.howDidYouHear,
      cvFileName: data.cvFileName || null,
      rawData: data,
      status: "New",
    }).returning();
    res.status(201).json({ success: true, id: row.id });
  } catch (err: any) {
    console.error("Error saving consultation:", err);
    res.status(500).json({ error: "Failed to save consultation" });
  }
});

router.post("/leads/assessment", async (req, res) => {
  try {
    const data = req.body;
    const err = validateRequired(data, ["fullName", "email", "mobile"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const [row] = await db.insert(assessments).values({
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality,
      maritalStatus: data.maritalStatus,
      destinations: data.destinations,
      studyLevel: data.studyLevel,
      courseArea: data.courseArea,
      highestQualification: data.highestQualification,
      academicPerformance: data.academicPerformance,
      fieldAlignment: data.fieldAlignment,
      previousEducation: data.previousEducation,
      hasLanguageQualification: data.hasLanguageQualification,
      languageQualificationType: data.languageQualificationType,
      languageScore: data.languageScore,
      englishLevel: data.englishLevel,
      budget: data.budget,
      additionalStrengths: data.additionalStrengths,
      hasResearchExperience: data.hasResearchExperience,
      preferredContactMethod: data.preferredContactMethod,
      howDidYouHear: data.howDidYouHear,
      cvFileName: data.cvFileName || null,
      overallScore: data.overallScore ?? null,
      scoreBand: data.scoreBand ?? null,
      scoreNotes: data.scoreNotes ?? null,
      followUpRequested: data.followUpRequested ?? false,
      rawData: data,
      status: "New",
    }).returning();
    res.status(201).json({ success: true, id: row.id });
  } catch (err: any) {
    console.error("Error saving assessment:", err);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

router.post("/leads/partners", async (req, res) => {
  try {
    const data = req.body;
    const err = validateRequired(data, ["fullName", "email"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const [row] = await db.insert(partnerRequests).values({
      fullName: data.fullName,
      position: data.position,
      organisation: data.organisation,
      email: data.email,
      phone: data.phone,
      website: data.website,
      services: data.services,
      studentNationalities: data.studentNationalities,
      country: data.country,
      destinations: data.destinations,
      additionalNotes: data.additionalNotes,
      rawData: data,
      status: "New",
    }).returning();
    res.status(201).json({ success: true, id: row.id });
  } catch (err: any) {
    console.error("Error saving partner request:", err);
    res.status(500).json({ error: "Failed to save partner request" });
  }
});

router.post("/leads/referral", async (req, res) => {
  try {
    const data = req.body;
    const err = validateRequired(data, ["fullName", "email"]);
    if (err) { res.status(400).json({ error: err }); return; }

    const [row] = await db.insert(studentReferrals).values({
      fullName: data.fullName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      university: data.university,
      studentNationalities: data.studentNationalities,
      destinations: data.destinations,
      additionalNotes: data.additionalNotes,
      rawData: data,
      status: "New",
    }).returning();
    res.status(201).json({ success: true, id: row.id });
  } catch (err: any) {
    console.error("Error saving student referral:", err);
    res.status(500).json({ error: "Failed to save student referral" });
  }
});

export default router;
