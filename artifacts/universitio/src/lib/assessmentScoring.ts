export interface AssessmentProfile {
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  destinations: string[];
  studyLevel: string;
  courseArea: string;
  highestQualification: string;
  academicPerformance: string;
  fieldAlignment: string;
  hasLanguageQualification: boolean;
  languageQualificationType?: string;
  languageScore?: string;
  englishLevel?: string;
  budget: string;
  additionalStrengths: string[];
  hasResearchExperience: boolean;
}

export interface DestinationScore {
  destination: string;
  score: number;
  band: string;
  bandColor: string;
  bandBgColor: string;
  restricted: boolean;
  restrictionMessage?: string;
  observations: string[];
}

const UK_RESTRICTED_NATIONALITIES = [
  "Afghanistan", "Cameroon", "Myanmar", "Sudan"
];

const USA_RESTRICTED_NATIONALITIES = [
  "Afghanistan", "Burma", "Burkina Faso", "Chad", "Republic of the Congo",
  "Equatorial Guinea", "Eritrea", "Haiti", "Iran", "Laos", "Libya",
  "Mali", "Niger", "Sierra Leone", "Somalia", "South Sudan", "Sudan",
  "Syria", "Yemen"
];

const ENGLISH_MEDIUM_DESTINATIONS = ["UK", "USA", "Canada", "Australia"];

function getAge(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function scoreNationality(nationality: string, destination: string): { score: number; restricted: boolean; message?: string } {
  let restricted = false;
  let message: string | undefined;

  if (destination === "UK" && UK_RESTRICTED_NATIONALITIES.includes(nationality)) {
    restricted = true;
    message = "Applications to the UK may currently be restricted for your nationality under current policy conditions.";
  }
  if (destination === "USA" && USA_RESTRICTED_NATIONALITIES.includes(nationality)) {
    restricted = true;
    message = "U.S. visa issuance may currently be suspended or restricted for your nationality under current policy conditions.";
  }

  if (restricted) return { score: 2, restricted, message };
  return { score: 15, restricted: false };
}

function getAcademicGap(profile: AssessmentProfile): number {
  const qualMap: Record<string, number> = {
    "High School": 1, "Diploma / College Diploma": 2,
    "Bachelor's Degree": 3, "Master's Degree": 4, "Other": 1
  };
  const levelMap: Record<string, number> = {
    "Foundation / Pathway": 1, "College": 1, "Bachelor's": 2,
    "Master's": 3, "PhD / Research": 4
  };
  return (levelMap[profile.studyLevel] || 2) - (qualMap[profile.highestQualification] || 1);
}

function scoreAcademic(profile: AssessmentProfile): number {
  const qualMap: Record<string, number> = {
    "High School": 1,
    "Diploma / College Diploma": 2,
    "Bachelor's Degree": 3,
    "Master's Degree": 4,
    "Other": 1
  };
  const levelMap: Record<string, number> = {
    "Foundation / Pathway": 1,
    "College": 1,
    "Bachelor's": 2,
    "Master's": 3,
    "PhD / Research": 4
  };

  const qualRank = qualMap[profile.highestQualification] || 1;
  const targetRank = levelMap[profile.studyLevel] || 2;
  const gap = targetRank - qualRank;

  let alignmentScore = 0;
  if (gap === 1) alignmentScore = 10;
  else if (gap === 0) alignmentScore = 8;
  else if (gap < 0) alignmentScore = 7;
  else if (gap === 2) alignmentScore = 3;
  else alignmentScore = 1;

  const perfMap: Record<string, number> = {
    "Excellent": 8, "Good": 5, "Average": 3, "Weak": 1
  };
  let perfScore = perfMap[profile.academicPerformance] || 3;

  if (gap >= 3) perfScore = Math.min(perfScore, 2);
  if (gap >= 2) perfScore = Math.min(perfScore, 5);

  return Math.min(20, alignmentScore + perfScore);
}

function scoreLanguage(profile: AssessmentProfile, destination: string): number {
  if (!profile.hasLanguageQualification) {
    if (!profile.englishLevel) return 1;
    const levelMap: Record<string, number> = {
      "Beginner": 1, "Elementary": 2, "Pre-Intermediate": 3,
      "Intermediate": 5, "Upper-Intermediate": 7, "Advanced": 9
    };
    return levelMap[profile.englishLevel] || 2;
  }

  const rawScore = parseFloat(profile.languageScore || "0");
  const type = profile.languageQualificationType || "";

  if (type === "German Language Certificate" && destination === "Germany") {
    return 15;
  }

  const isGeneral = type === "IELTS General";

  let pts = 0;
  if (rawScore >= 8.0) pts = 18;
  else if (rawScore >= 7.5) pts = 16;
  else if (rawScore >= 7.0) pts = 14;
  else if (rawScore >= 6.5) pts = 12;
  else if (rawScore >= 6.0) pts = 10;
  else if (rawScore >= 5.5) pts = 8;
  else if (rawScore >= 5.0) pts = 6;
  else if (rawScore >= 4.5) pts = 4;
  else pts = 3;

  if (isGeneral && pts > 10) pts = 10;

  if (type === "Duolingo English Test") {
    if (rawScore >= 130) pts = 16;
    else if (rawScore >= 120) pts = 14;
    else if (rawScore >= 110) pts = 11;
    else if (rawScore >= 100) pts = 9;
    else if (rawScore >= 90) pts = 7;
    else pts = 4;
  }

  if (type === "TOEFL") {
    if (rawScore >= 110) pts = 18;
    else if (rawScore >= 100) pts = 15;
    else if (rawScore >= 90) pts = 13;
    else if (rawScore >= 80) pts = 10;
    else if (rawScore >= 70) pts = 8;
    else if (rawScore >= 60) pts = 6;
    else pts = 4;
  }

  if (type === "PTE Academic") {
    if (rawScore >= 76) pts = 18;
    else if (rawScore >= 65) pts = 15;
    else if (rawScore >= 58) pts = 12;
    else if (rawScore >= 50) pts = 10;
    else if (rawScore >= 42) pts = 7;
    else pts = 5;
  }

  return Math.min(20, pts);
}

function scoreBudget(budget: string, destination: string): number {
  const euroCountries = ["Germany", "Netherlands"];
  const isEuro = euroCountries.includes(destination);

  if (budget === "over20k") {
    return isEuro ? 15 : 13;
  }
  if (budget === "10k-20k") {
    if (isEuro) return 11;
    if (destination === "Canada") return 7;
    return 5;
  }
  if (isEuro) return 6;
  if (destination === "Canada") return 2;
  return 1;
}

function scoreAlignment(profile: AssessmentProfile): number {
  const map: Record<string, number> = {
    "Yes, same field": 8,
    "Yes, related field": 5,
    "No, different field": 2,
    "Not sure yet": 3
  };
  return map[profile.fieldAlignment] || 3;
}

function scoreProfileStrength(profile: AssessmentProfile): number {
  let pts = 0;
  const strengthPoints: Record<string, number> = {
    "GRE": 1.5, "GMAT": 1.5, "SAT": 1.5, "A-Levels": 1.5,
    "Foundation Programme": 1, "Published Research": 2.5,
    "Research Experience": 1.5, "Work Experience": 1,
    "Internship Experience": 0.5, "Portfolio": 1.5,
    "Relevant Professional Certifications": 1.5
  };
  for (const s of profile.additionalStrengths) {
    pts += strengthPoints[s] || 0.5;
  }
  if (profile.hasResearchExperience) {
    const isPhd = profile.studyLevel === "PhD / Research";
    pts += isPhd ? 2 : 1;
  }
  return Math.min(10, pts);
}

function scoreAge(profile: AssessmentProfile): number {
  const age = getAge(profile.dateOfBirth);
  const level = profile.studyLevel;

  if (level === "Foundation / Pathway" || level === "College" || level === "Bachelor's") {
    if (age >= 17 && age <= 22) return 10;
    if (age >= 23 && age <= 25) return 7;
    if (age >= 26 && age <= 30) return 5;
    if (age >= 31 && age <= 35) return 4;
    return 3;
  }
  if (level === "Master's") {
    if (age >= 21 && age <= 28) return 10;
    if (age >= 29 && age <= 33) return 7;
    if (age >= 34 && age <= 40) return 5;
    if (age >= 18 && age <= 20) return 5;
    return 3;
  }
  if (level === "PhD / Research") {
    if (age >= 23 && age <= 32) return 10;
    if (age >= 33 && age <= 40) return 7;
    if (age >= 41 && age <= 50) return 5;
    if (age >= 18 && age <= 22) return 5;
    return 4;
  }
  return 5;
}

function applyCaps(
  rawTotal: number,
  profile: AssessmentProfile,
  natResult: { restricted: boolean },
  languageScore: number,
  budgetScore: number,
  academicScore: number,
  destination: string,
): number {
  let capped = rawTotal;

  if (natResult.restricted) {
    capped = Math.min(capped, 35);
  }

  const academicGap = getAcademicGap(profile);
  if (academicGap >= 3) {
    capped = Math.min(capped, 40);
  } else if (academicGap >= 2) {
    capped = Math.min(capped, 55);
  } else if (academicScore <= 5) {
    capped = Math.min(capped, 55);
  }

  if (ENGLISH_MEDIUM_DESTINATIONS.includes(destination)) {
    if (!profile.hasLanguageQualification) {
      if (languageScore <= 5) {
        capped = Math.min(capped, 45);
      } else {
        capped = Math.min(capped, 58);
      }
    } else if (languageScore <= 6) {
      capped = Math.min(capped, 55);
    }
  }

  if (profile.budget === "under10k") {
    if (["UK", "USA", "Australia"].includes(destination)) {
      capped = Math.min(capped, 42);
    } else if (destination === "Canada") {
      capped = Math.min(capped, 48);
    }
  }

  const isWeakPerformance = profile.academicPerformance === "Weak";
  const isWeakLanguage = !profile.hasLanguageQualification && languageScore <= 5;
  const isWeakBudget = budgetScore <= 2;

  let weaknessCount = 0;
  if (isWeakBudget) weaknessCount++;
  if (languageScore <= 5) weaknessCount++;
  if (academicScore <= 5 || isWeakPerformance) weaknessCount++;
  if (academicGap >= 2) weaknessCount++;

  if (weaknessCount >= 3) {
    capped = Math.min(capped, 32);
  } else if (weaknessCount >= 2) {
    capped = Math.min(capped, 42);
  }

  if (isWeakPerformance && isWeakLanguage && isWeakBudget) {
    capped = Math.min(capped, 28);
  } else if (isWeakPerformance && (isWeakLanguage || isWeakBudget)) {
    capped = Math.min(capped, 35);
  }

  return capped;
}

function generateObservations(profile: AssessmentProfile, scores: {
  academic: number; language: number; budget: number;
  alignment: number; profileStrength: number; age: number;
}, destination: string): string[] {
  const obs: string[] = [];

  if (scores.academic >= 14)
    obs.push("Your academic background appears well aligned with your intended level of study.");
  else if (scores.academic >= 8)
    obs.push("Your academic profile is reasonable but could be strengthened for more competitive programmes.");
  else
    obs.push("Your academic profile may need further development before applying to your intended level. A pathway or foundation programme could help.");

  if (scores.language >= 14)
    obs.push("Your language qualifications are strong for this destination.");
  else if (scores.language >= 8)
    obs.push("Your language profile could be strengthened — a higher score would open more options.");
  else if (profile.hasLanguageQualification)
    obs.push("Consider retaking your language test to improve your score — a higher result will significantly strengthen your application.");
  else
    obs.push("Obtaining a recognised language qualification is strongly recommended and would meaningfully improve your admission potential.");

  if (scores.budget >= 10)
    obs.push("Your budget level is suitable for study in this destination.");
  else if (scores.budget >= 5)
    obs.push("Your budget is workable for some programmes — we can help identify affordable options within your range.");
  else
    obs.push("Your budget may significantly limit your options in this destination. Exploring scholarships or alternative destinations could be beneficial.");

  if (scores.alignment >= 6)
    obs.push("Your intended course aligns well with your academic background, which strengthens your application.");
  else if (scores.alignment <= 3)
    obs.push("Switching to a different field may require additional preparation or a foundation pathway.");
  else
    obs.push("Your study field alignment is reasonable — a well-crafted personal statement can bridge any gaps.");

  return obs.slice(0, 4);
}

export function getBand(score: number): { band: string; bandColor: string; bandBgColor: string } {
  if (score >= 90) return { band: "Strong potential", bandColor: "text-green-600", bandBgColor: "bg-green-50" };
  if (score >= 75) return { band: "Good potential", bandColor: "text-emerald-500", bandBgColor: "bg-emerald-50" };
  if (score >= 60) return { band: "Moderate potential", bandColor: "text-yellow-600", bandBgColor: "bg-yellow-50" };
  if (score >= 40) return { band: "Developing profile", bandColor: "text-orange-500", bandBgColor: "bg-orange-50" };
  return { band: "Low admission readiness", bandColor: "text-red-500", bandBgColor: "bg-red-50" };
}

export function computeScores(profile: AssessmentProfile): DestinationScore[] {
  return profile.destinations.map((dest) => {
    const natResult = scoreNationality(profile.nationality, dest);
    const academic = scoreAcademic(profile);
    const language = scoreLanguage(profile, dest);
    const budget = scoreBudget(profile.budget, dest);
    const alignment = scoreAlignment(profile);
    const profileStrength = scoreProfileStrength(profile);
    const age = scoreAge(profile);

    const rawTotal = Math.round(
      natResult.score + academic + language + budget + alignment + profileStrength + age
    );

    const capped = applyCaps(rawTotal, profile, natResult, language, budget, academic, dest);
    const finalScore = Math.min(100, Math.max(0, capped));
    const { band, bandColor, bandBgColor } = getBand(finalScore);
    const observations = generateObservations(
      profile,
      { academic, language, budget, alignment, profileStrength, age },
      dest
    );

    return {
      destination: dest,
      score: finalScore,
      band,
      bandColor,
      bandBgColor,
      restricted: natResult.restricted,
      restrictionMessage: natResult.message,
      observations,
    };
  });
}
