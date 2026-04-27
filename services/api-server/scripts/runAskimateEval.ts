/**
 * AskiMate AI Evaluation Harness
 *
 * Runs a fixed set of real questions through the production AI pipeline and
 * reports on retrieval accuracy and review-level accuracy.
 *
 * Usage (from workspace root):
 *   pnpm --filter @workspace/api-server run eval-ai
 *
 * Or directly from artifacts/api-server/:
 *   npx tsx scripts/runAskimateEval.ts
 *
 * Output:
 *   src/ai/eval_report.json   — machine-readable full report
 *   stdout                    — human-readable summary
 *
 * This script is ISOLATED. It does NOT touch the database or production state.
 * It calls generateAiAnswer() which reads the local KB and vector store files.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { generateAiAnswer } from "../src/ai/chatService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const QUESTIONS_PATH = path.join(__dirname, "../src/ai/eval_questions.json");
const REPORT_PATH = path.join(__dirname, "../src/ai/eval_report.json");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface EvalQuestion {
  id: string;
  question: string;
  expectedPrimarySource: string;
  expectedReviewLevel: string;
  notes: string;
}

type Grade = "pass" | "partial" | "fail";

interface EvalResult {
  id: string;
  question: string;
  expectedPrimarySource: string;
  expectedReviewLevel: string;
  actualPrimarySource: string;
  actualReviewLevel: string;
  mode: string;
  top3Sources: { id: string; title: string; score: number }[];
  answerPreview: string;
  sourceMatch: boolean;
  reviewLevelMatch: boolean;
  grade: Grade;
  notes: string;
  error?: string;
}

interface EvalReport {
  timestamp: string;
  totalQuestions: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  results: EvalResult[];
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------
function grade(sourceMatch: boolean, reviewLevelMatch: boolean): Grade {
  if (sourceMatch && reviewLevelMatch) return "pass";
  if (sourceMatch || reviewLevelMatch) return "partial";
  return "fail";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

function gradeEmoji(g: Grade): string {
  if (g === "pass") return "PASS   ";
  if (g === "partial") return "PARTIAL";
  return "FAIL   ";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  // Verify OPENAI_API_KEY is available
  if (!process.env.OPENAI_API_KEY) {
    console.error("[EVAL] ERROR: OPENAI_API_KEY is not set. Cannot run evaluation.");
    process.exit(1);
  }

  // Load eval questions
  if (!fs.existsSync(QUESTIONS_PATH)) {
    console.error(`[EVAL] ERROR: Eval questions file not found at ${QUESTIONS_PATH}`);
    process.exit(1);
  }

  const questions: EvalQuestion[] = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  console.log(`\n[EVAL] AskiMate AI Evaluation Harness`);
  console.log(`[EVAL] ${questions.length} questions loaded`);
  console.log(`[EVAL] Running each through the production AI pipeline...\n`);

  const results: EvalResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    process.stdout.write(`  [${String(i + 1).padStart(2, "0")}/${questions.length}] ${q.question.slice(0, 70)}...`);

    let result: EvalResult;

    try {
      const aiResult = await generateAiAnswer(q.question);

      const actualPrimarySource = aiResult.sources[0]?.id ?? "(none)";
      const actualReviewLevel = aiResult.reviewLevel;
      const sourceMatch = actualPrimarySource === q.expectedPrimarySource;
      const reviewLevelMatch = actualReviewLevel === q.expectedReviewLevel;

      result = {
        id: q.id,
        question: q.question,
        expectedPrimarySource: q.expectedPrimarySource,
        expectedReviewLevel: q.expectedReviewLevel,
        actualPrimarySource,
        actualReviewLevel,
        mode: aiResult.mode,
        top3Sources: aiResult.sources.slice(0, 3),
        answerPreview: aiResult.answer.slice(0, 200),
        sourceMatch,
        reviewLevelMatch,
        grade: grade(sourceMatch, reviewLevelMatch),
        notes: q.notes,
      };

      const g = gradeEmoji(result.grade);
      const sourceMark = sourceMatch ? "src✓" : "src✗";
      const levelMark = reviewLevelMatch ? "lvl✓" : "lvl✗";
      process.stdout.write(` ${g} ${sourceMark} ${levelMark}\n`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      result = {
        id: q.id,
        question: q.question,
        expectedPrimarySource: q.expectedPrimarySource,
        expectedReviewLevel: q.expectedReviewLevel,
        actualPrimarySource: "(error)",
        actualReviewLevel: "(error)",
        mode: "(error)",
        top3Sources: [],
        answerPreview: "",
        sourceMatch: false,
        reviewLevelMatch: false,
        grade: "fail",
        notes: q.notes,
        error: errorMsg,
      };
      process.stdout.write(` FAIL    [ERROR: ${errorMsg.slice(0, 60)}]\n`);
    }

    results.push(result);

    // Small delay to avoid rate-limiting
    if (i < questions.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // ---------------------------------------------------------------------------
  // Tally
  // ---------------------------------------------------------------------------
  const passCount = results.filter((r) => r.grade === "pass").length;
  const partialCount = results.filter((r) => r.grade === "partial").length;
  const failCount = results.filter((r) => r.grade === "fail").length;

  // ---------------------------------------------------------------------------
  // Write JSON report
  // ---------------------------------------------------------------------------
  const report: EvalReport = {
    timestamp: new Date().toISOString(),
    totalQuestions: questions.length,
    passCount,
    partialCount,
    failCount,
    results,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

  // ---------------------------------------------------------------------------
  // Human-readable summary
  // ---------------------------------------------------------------------------
  const divider = "─".repeat(72);

  console.log(`\n${divider}`);
  console.log(`  ASKIMATE EVAL REPORT — ${new Date().toUTCString()}`);
  console.log(divider);
  console.log(`  Total:   ${questions.length}`);
  console.log(`  PASS:    ${passCount}  (source correct AND reviewLevel correct)`);
  console.log(`  PARTIAL: ${partialCount}  (one of them correct)`);
  console.log(`  FAIL:    ${failCount}  (both wrong, or error)`);
  console.log(divider);

  // Failed questions
  const failed = results.filter((r) => r.grade === "fail");
  if (failed.length > 0) {
    console.log(`\n  FAILED QUESTIONS (${failed.length}):`);
    for (const r of failed) {
      console.log(`\n  [${r.id}] ${r.question}`);
      if (r.error) {
        console.log(`          ERROR: ${r.error}`);
      } else {
        console.log(`          Source:      expected=${r.expectedPrimarySource}  actual=${r.actualPrimarySource}`);
        console.log(`          ReviewLevel: expected=${r.expectedReviewLevel}  actual=${r.actualReviewLevel}`);
      }
    }
  } else {
    console.log(`\n  No failed questions.`);
  }

  // Wrong top source (partial + fail with source mismatch)
  const wrongSource = results.filter((r) => !r.sourceMatch && r.grade !== "fail" || (r.grade === "fail" && !r.error));
  const allWrongSource = results.filter((r) => !r.sourceMatch && !r.error);
  if (allWrongSource.length > 0) {
    console.log(`\n  WRONG PRIMARY SOURCE (${allWrongSource.length}):`);
    for (const r of allWrongSource) {
      console.log(`  [${r.id}] ${pad(r.expectedPrimarySource, 34)} → got ${r.actualPrimarySource}`);
      console.log(`          ${r.question.slice(0, 68)}`);
    }
  } else {
    console.log(`\n  All primary sources correct.`);
  }

  // Wrong review level
  const allWrongLevel = results.filter((r) => !r.reviewLevelMatch && !r.error);
  if (allWrongLevel.length > 0) {
    console.log(`\n  WRONG REVIEW LEVEL (${allWrongLevel.length}):`);
    for (const r of allWrongLevel) {
      console.log(`  [${r.id}] expected=${pad(r.expectedReviewLevel, 16)} got=${r.actualReviewLevel}`);
      console.log(`          ${r.question.slice(0, 68)}`);
    }
  } else {
    console.log(`\n  All review levels correct.`);
  }

  console.log(`\n${divider}`);
  console.log(`  Report saved to: ${REPORT_PATH}`);
  console.log(`${divider}\n`);

  // Exit with non-zero if any failures
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[EVAL] Fatal error:", err);
  process.exit(1);
});
