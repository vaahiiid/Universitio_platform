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

  if (restricted) return { score: 3, restricted, message };
  return { score: 15, restricted: false };
}

function scoreAcademic(profile: AssessmentProfile): number {
  const qualMap: Record<string, number> = {
    "High School": 1,
    "Diploma / College Diploma": 2,
    "Bachelor's Degree": 3,
    "Master's Degree": 4,
    "Other": 2
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

  let alignmentScore = 0;
  if (qualRank === targetRank - 1) alignmentScore = 12;
  else if (qualRank === targetRank) alignmentScore = 10;
  else if (qualRank >= targetRank) alignmentScore = 8;
  else if (qualRank === targetRank - 2) alignmentScore = 6;
  else alignmentScore = 4;

  const perfMap: Record<string, number> = {
    "Excellent": 8, "Good": 6, "Average": 4, "Weak": 2
  };
  const perfScore = perfMap[profile.academicPerformance] || 4;

  return Math.min(20, alignmentScore + perfScore);
}

function scoreLanguage(profile: AssessmentProfile, destination: string): number {
  if (!profile.hasLanguageQualification) {
    if (!profile.englishLevel) return 2;
    const levelMap: Record<string, number> = {
      "Beginner": 2, "Elementary": 4, "Pre-Intermediate": 6,
      "Intermediate": 8, "Upper-Intermediate": 12, "Advanced": 15
    };
    return levelMap[profile.englishLevel] || 4;
  }

  const rawScore = parseFloat(profile.languageScore || "0");
  const type = profile.languageQualificationType || "";

  if (type === "German Language Certificate" && destination === "Germany") {
    return 18;
  }

  const isGeneral = type === "IELTS General";

  let pts = 0;
  if (rawScore >= 8.0) pts = 20;
  else if (rawScore >= 7.5) pts = 19;
  else if (rawScore >= 7.0) pts = 18;
  else if (rawScore >= 6.5) pts = 16;
  else if (rawScore >= 6.0) pts = 14;
  else if (rawScore >= 5.5) pts = 12;
  else if (rawScore >= 5.0) pts = 9;
  else if (rawScore >= 4.5) pts = 6;
  else pts = 4;

  if (isGeneral && pts > 14) pts = 14;

  if (type === "Duolingo English Test") {
    if (rawScore >= 130) pts = 18;
    else if (rawScore >= 120) pts = 16;
    else if (rawScore >= 110) pts = 14;
    else if (rawScore >= 100) pts = 12;
    else if (rawScore >= 90) pts = 9;
    else pts = 6;
  }

  if (type === "TOEFL") {
    if (rawScore >= 110) pts = 20;
    else if (rawScore >= 100) pts = 18;
    else if (rawScore >= 90) pts = 16;
    else if (rawScore >= 80) pts = 14;
    else if (rawScore >= 70) pts = 12;
    else if (rawScore >= 60) pts = 9;
    else pts = 6;
  }

  if (type === "PTE Academic") {
    if (rawScore >= 76) pts = 20;
    else if (rawScore >= 65) pts = 18;
    else if (rawScore >= 58) pts = 16;
    else if (rawScore >= 50) pts = 14;
    else if (rawScore >= 42) pts = 12;
    else pts = 8;
  }

  return Math.min(20, pts);
}

function scoreBudget(budget: string, destination: string): number {
  const euroCountries = ["Germany", "Netherlands"];
  const isEuro = euroCountries.includes(destination);

  if (budget === "over20k") {
    return 15;
  }
  if (budget === "10k-20k") {
    if (isEuro) return 14;
    return 11;
  }
  if (isEuro) return 8;
  if (destination === "USA" || destination === "Australia") return 4;
  return 3;
}

function scoreAlignment(profile: AssessmentProfile): number {
  const map: Record<string, number> = {
    "Yes, same field": 10,
    "Yes, related field": 8,
    "No, different field": 4,
    "Not sure yet": 6
  };
  return map[profile.fieldAlignment] || 5;
}

function scoreProfileStrength(profile: AssessmentProfile): number {
  let pts = 0;
  const strengthPoints: Record<string, number> = {
    "GRE": 2, "GMAT": 2, "SAT": 2, "A-Levels": 2,
    "Foundation Programme": 1.5, "Published Research": 3,
    "Research Experience": 2, "Work Experience": 1.5,
    "Internship Experience": 1, "Portfolio": 2,
    "Relevant Professional Certifications": 2
  };
  for (const s of profile.additionalStrengths) {
    pts += strengthPoints[s] || 1;
  }
  if (profile.hasResearchExperience) {
    const isPhd = profile.studyLevel === "PhD / Research";
    pts += isPhd ? 3 : 1.5;
  }
  return Math.min(10, pts);
}

function scoreAge(profile: AssessmentProfile): number {
  const age = getAge(profile.dateOfBirth);
  const level = profile.studyLevel;

  if (level === "Foundation / Pathway" || level === "College" || level === "Bachelor's") {
    if (age >= 17 && age <= 22) return 10;
    if (age >= 23 && age <= 25) return 8;
    if (age >= 26 && age <= 30) return 6;
    if (age >= 31 && age <= 35) return 4;
    return 3;
  }
  if (level === "Master's") {
    if (age >= 21 && age <= 30) return 10;
    if (age >= 31 && age <= 35) return 8;
    if (age >= 36 && age <= 40) return 6;
    if (age >= 18 && age <= 20) return 7;
    return 4;
  }
  if (level === "PhD / Research") {
    if (age >= 23 && age <= 35) return 10;
    if (age >= 36 && age <= 45) return 8;
    if (age >= 18 && age <= 22) return 7;
    return 5;
  }
  return 6;
}

function generateObservations(profile: AssessmentProfile, scores: {
  academic: number; language: number; budget: number;
  alignment: number; profileStrength: number; age: number;
}, destination: string): string[] {
  const obs: string[] = [];

  if (scores.academic >= 16)
    obs.push("Your academic background appears well aligned with your intended level of study.");
  else if (scores.academic >= 10)
    obs.push("Your academic profile is reasonable but could be strengthened for more competitive programmes.");
  else
    obs.push("Your academic profile may need further development before applying to your intended level.");

  if (scores.language >= 16)
    obs.push("Your language qualifications are strong for this destination.");
  else if (scores.language >= 10)
    obs.push("Your language profile could be strengthened for more competitive options.");
  else if (profile.hasLanguageQualification)
    obs.push("Consider retaking your language test to improve your score — a higher result will open more opportunities.");
  else
    obs.push("Obtaining a recognised language qualification would significantly strengthen your application.");

  if (scores.budget >= 13)
    obs.push("Your budget level is well suited for study in this destination.");
  else if (scores.budget >= 9)
    obs.push("Your budget is workable for some programmes in this destination — we can help identify suitable options.");
  else {
    if (destination === "UK" || destination === "USA")
      obs.push("Your budget may limit some options in this destination, but affordable pathways may still exist.");
    else
      obs.push("Your budget may require careful programme selection — we can help find options within your range.");
  }

  if (scores.alignment >= 8)
    obs.push("Your intended course aligns well with your academic background, which strengthens your application.");
  else if (scores.alignment <= 5)
    obs.push("Switching to a different field may require additional preparation or a foundation pathway.");
  else
    obs.push("Your study field alignment is reasonable — a well-crafted personal statement can bridge any gaps.");

  if (scores.profileStrength >= 7)
    obs.push("Your additional qualifications and experience add meaningful value to your profile.");

  if (scores.age >= 9)
    obs.push("Your age profile is well suited for your intended level of study.");

  return obs.slice(0, 4);
}

export function getBand(score: number): { band: string; bandColor: string } {
  if (score >= 80) return { band: "Strong admission potential", bandColor: "text-green-600" };
  if (score >= 60) return { band: "Good potential with minor improvements recommended", bandColor: "text-blue-600" };
  if (score >= 40) return { band: "Moderate potential — profile strengthening recommended", bandColor: "text-amber-600" };
  return { band: "Further preparation is recommended before applying", bandColor: "text-red-600" };
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

    const total = Math.round(
      natResult.score + academic + language + budget + alignment + profileStrength + age
    );
    const clamped = Math.min(100, Math.max(0, total));
    const { band, bandColor } = getBand(clamped);
    const observations = generateObservations(
      profile,
      { academic, language, budget, alignment, profileStrength, age },
      dest
    );

    return {
      destination: dest,
      score: clamped,
      band,
      bandColor,
      restricted: natResult.restricted,
      restrictionMessage: natResult.message,
      observations,
    };
  });
}
