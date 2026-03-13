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
  explanations: string[];
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

  if (restricted) return { score: 3, restricted, message };
  return { score: 10, restricted: false };
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
  else if (gap === 0) alignmentScore = 9;
  else if (gap < 0) alignmentScore = 8;
  else if (gap === 2) alignmentScore = 5;
  else alignmentScore = 3;

  const perfMap: Record<string, number> = {
    "Distinction": 10, "Merit": 7, "Pass": 5, "Needs Improvement": 2
  };
  let perfScore = perfMap[profile.academicPerformance] || 5;

  if (gap >= 3) perfScore = Math.min(perfScore, 3);
  if (gap >= 2) perfScore = Math.min(perfScore, 6);

  return Math.min(18, alignmentScore + perfScore);
}

function scoreLanguage(profile: AssessmentProfile, destination: string): number {
  if (!profile.hasLanguageQualification) {
    if (!profile.englishLevel) return 2;
    const levelMap: Record<string, number> = {
      "Beginner": 2, "Elementary": 4, "Pre-Intermediate": 6,
      "Intermediate": 8, "Upper-Intermediate": 10, "Advanced": 13
    };
    return levelMap[profile.englishLevel] || 4;
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
  else if (rawScore >= 4.5) pts = 5;
  else pts = 4;

  if (isGeneral && pts > 10) pts = 10;

  if (type === "Duolingo English Test") {
    if (rawScore >= 130) pts = 16;
    else if (rawScore >= 120) pts = 14;
    else if (rawScore >= 110) pts = 11;
    else if (rawScore >= 100) pts = 9;
    else if (rawScore >= 90) pts = 7;
    else pts = 5;
  }

  if (type === "TOEFL") {
    if (rawScore >= 110) pts = 18;
    else if (rawScore >= 100) pts = 15;
    else if (rawScore >= 90) pts = 13;
    else if (rawScore >= 80) pts = 10;
    else if (rawScore >= 70) pts = 8;
    else if (rawScore >= 60) pts = 6;
    else pts = 5;
  }

  if (type === "PTE Academic") {
    if (rawScore >= 76) pts = 18;
    else if (rawScore >= 65) pts = 15;
    else if (rawScore >= 58) pts = 12;
    else if (rawScore >= 50) pts = 10;
    else if (rawScore >= 42) pts = 7;
    else pts = 5;
  }

  return Math.min(18, pts);
}

function scoreBudget(budget: string, destination: string): number {
  const euroCountries = ["Germany", "Netherlands"];
  const isEuro = euroCountries.includes(destination);

  if (budget === "over20k") {
    return 25;
  }
  if (budget === "10k-20k") {
    if (isEuro) return 20;
    if (destination === "Canada") return 16;
    return 14;
  }
  if (isEuro) return 14;
  if (destination === "Canada") return 8;
  return 6;
}

function scoreAlignment(profile: AssessmentProfile): number {
  const map: Record<string, number> = {
    "Yes, same field": 8,
    "Yes, related field": 6,
    "No, different field": 3,
    "Not sure yet": 4
  };
  return map[profile.fieldAlignment] || 4;
}

function scoreProfileStrength(profile: AssessmentProfile): number {
  let pts = 0;
  const strengthPoints: Record<string, number> = {
    "GRE": 1.5, "GMAT": 1.5, "SAT": 1.5, "A-Levels": 1.5,
    "Foundation Programme": 1, "Published Research": 2.5,
    "Research Experience": 1.5, "Work Experience": 1.5,
    "Internship Experience": 1, "Portfolio": 1.5,
    "Relevant Professional Certifications": 1.5
  };
  for (const s of profile.additionalStrengths) {
    pts += strengthPoints[s] || 0.5;
  }
  if (profile.hasResearchExperience) {
    const isPhd = profile.studyLevel === "PhD / Research";
    pts += isPhd ? 2.5 : 1.5;
  }
  return Math.min(10, pts);
}

function scoreAge(profile: AssessmentProfile): number {
  const age = getAge(profile.dateOfBirth);
  const level = profile.studyLevel;

  if (level === "Foundation / Pathway" || level === "College" || level === "Bachelor's") {
    if (age >= 17 && age <= 24) return 10;
    if (age >= 25 && age <= 28) return 8;
    if (age >= 29 && age <= 33) return 6;
    if (age >= 34 && age <= 38) return 5;
    return 4;
  }
  if (level === "Master's") {
    if (age >= 21 && age <= 30) return 10;
    if (age >= 31 && age <= 36) return 8;
    if (age >= 37 && age <= 42) return 6;
    if (age >= 18 && age <= 20) return 6;
    return 4;
  }
  if (level === "PhD / Research") {
    if (age >= 23 && age <= 35) return 10;
    if (age >= 36 && age <= 42) return 8;
    if (age >= 43 && age <= 50) return 6;
    if (age >= 18 && age <= 22) return 6;
    return 5;
  }
  return 6;
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
    capped = Math.min(capped, 40);
  }

  const academicGap = getAcademicGap(profile);
  if (academicGap >= 3) {
    capped = Math.min(capped, 48);
  } else if (academicGap >= 2) {
    capped = Math.min(capped, 60);
  } else if (academicScore <= 6) {
    capped = Math.min(capped, 62);
  }

  if (ENGLISH_MEDIUM_DESTINATIONS.includes(destination)) {
    if (!profile.hasLanguageQualification) {
      if (languageScore <= 6) {
        capped = Math.min(capped, 55);
      } else {
        capped = Math.min(capped, 65);
      }
    } else if (languageScore <= 6) {
      capped = Math.min(capped, 60);
    }
  }

  if (profile.budget === "under10k") {
    if (["UK", "USA", "Australia"].includes(destination)) {
      capped = Math.min(capped, 55);
    } else if (destination === "Canada") {
      capped = Math.min(capped, 58);
    }
  }

  const isWeakPerformance = profile.academicPerformance === "Needs Improvement";
  const isWeakLanguage = !profile.hasLanguageQualification && languageScore <= 6;
  const isWeakBudget = budgetScore <= 8;

  let weaknessCount = 0;
  if (isWeakBudget) weaknessCount++;
  if (languageScore <= 6) weaknessCount++;
  if (academicScore <= 6 || isWeakPerformance) weaknessCount++;
  if (academicGap >= 2) weaknessCount++;

  if (weaknessCount >= 3) {
    capped = Math.min(capped, 40);
  } else if (weaknessCount >= 2) {
    capped = Math.min(capped, 50);
  }

  if (isWeakPerformance && isWeakLanguage && isWeakBudget) {
    capped = Math.min(capped, 35);
  } else if (isWeakPerformance && (isWeakLanguage || isWeakBudget)) {
    capped = Math.min(capped, 42);
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
  else if (scores.academic >= 9)
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

  const destNames: Record<string, string> = {
    "UK": "the UK", "USA": "the USA", "Canada": "Canada",
    "Germany": "Germany", "Netherlands": "the Netherlands", "Australia": "Australia"
  };
  const destLabel = destNames[destination] || "this destination";

  if (scores.budget >= 18)
    obs.push(`Your budget level is well suited for study in ${destLabel}.`);
  else if (scores.budget >= 10)
    obs.push(`Your budget is workable for some programmes in ${destLabel} — we can help identify affordable options within your range.`);
  else
    obs.push(`Your budget may limit your options in ${destLabel}. Exploring scholarships or more affordable programmes could be beneficial.`);

  if (scores.alignment >= 6)
    obs.push("Your intended course aligns well with your academic background, which strengthens your application.");
  else if (scores.alignment <= 3)
    obs.push("Switching to a different field may require additional preparation or a foundation pathway.");
  else
    obs.push("Your study field alignment is reasonable — a well-crafted personal statement can bridge any gaps.");

  return obs.slice(0, 4);
}

function generateExplanations(profile: AssessmentProfile, scores: {
  academic: number; language: number; budget: number;
  alignment: number; profileStrength: number; age: number;
}, destination: string): string[] {
  const reasons: { priority: number; text: string }[] = [];
  const destNames: Record<string, string> = {
    "UK": "the UK", "USA": "the USA", "Canada": "Canada",
    "Germany": "Germany", "Netherlands": "the Netherlands", "Australia": "Australia"
  };
  const destLabel = destNames[destination] || "this destination";

  if (scores.budget < 14) {
    reasons.push({ priority: 1, text: `Budget is below the typical cost for study in ${destLabel}.` });
  } else if (scores.budget < 20) {
    reasons.push({ priority: 8, text: `A higher budget would give you more programme choices in ${destLabel}.` });
  }

  if (scores.language < 8) {
    reasons.push({ priority: 2, text: "Language readiness needs strengthening — a recognised test score would help." });
  } else if (scores.language < 12) {
    reasons.push({ priority: 3, text: "A higher language test score would open more competitive programme options." });
  } else if (scores.language < 16) {
    reasons.push({ priority: 9, text: "Improving your language score further could unlock the most selective programmes." });
  }

  if (scores.academic < 8) {
    reasons.push({ priority: 2, text: "Academic background may need further development for the intended study level." });
  } else if (scores.academic < 12) {
    reasons.push({ priority: 4, text: "Stronger academic grades would improve competitiveness for top programmes." });
  } else if (scores.academic < 16) {
    reasons.push({ priority: 10, text: "Top-tier programmes look for the strongest academic records — yours is solid but could be even more competitive." });
  }

  if (scores.alignment <= 3) {
    reasons.push({ priority: 5, text: "Changing study field may require a foundation or bridging programme." });
  }

  if (scores.profileStrength < 3) {
    reasons.push({ priority: 6, text: "Adding qualifications like work experience, certifications, or test scores would strengthen the profile." });
  } else if (scores.profileStrength < 6) {
    reasons.push({ priority: 11, text: "Extra credentials such as research, certifications, or relevant work experience would give your application an edge." });
  }

  if (scores.age < 6) {
    reasons.push({ priority: 7, text: "Age relative to the chosen study level may affect some admission decisions." });
  }

  if (reasons.length === 0) {
    reasons.push({ priority: 99, text: "Your profile is very strong overall — our consultants can help you target the most competitive programmes." });
  }

  reasons.sort((a, b) => a.priority - b.priority);
  return reasons.slice(0, 3).map(r => r.text);
}

export function getBand(score: number): { band: string; bandColor: string; bandBgColor: string } {
  if (score >= 90) return { band: "Top Shape", bandColor: "text-green-700", bandBgColor: "bg-green-50" };
  if (score >= 70) return { band: "Strong Potential", bandColor: "text-green-500", bandBgColor: "bg-green-50/70" };
  if (score >= 50) return { band: "On the Right Track", bandColor: "text-amber-600", bandBgColor: "bg-amber-50" };
  return { band: "Needs a Boost", bandColor: "text-red-500", bandBgColor: "bg-red-50" };
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
    const floored = Math.max(30, capped);
    const finalScore = Math.min(100, floored);
    const { band, bandColor, bandBgColor } = getBand(finalScore);
    const observations = generateObservations(
      profile,
      { academic, language, budget, alignment, profileStrength, age },
      dest
    );
    const explanations = generateExplanations(
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
      explanations,
    };
  });
}
