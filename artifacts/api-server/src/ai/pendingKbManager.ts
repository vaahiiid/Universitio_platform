import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPROVED_KB_FILE = path.join(__dirname, "approved_kb_entries.json");

export interface ApprovedKbEntry {
  id: string;
  sourceQuestion: string;
  humanAnswer: string;
  normalizedQuestion: string;
  domain: string;
  risk_level: "low" | "medium" | "high";
  approvedForKb: true;
  approvedBy: string;
  approvedAt: string;
  status: "pending_ingest" | "ingested";
  ingestedAt?: string;
  conversationId: number;
  aiAnswer?: string;
  reviewLevel?: string;
  topSources?: string[];
}

function readEntries(): ApprovedKbEntry[] {
  try {
    if (!fs.existsSync(APPROVED_KB_FILE)) {
      fs.writeFileSync(APPROVED_KB_FILE, "[]", "utf-8");
      return [];
    }
    return JSON.parse(fs.readFileSync(APPROVED_KB_FILE, "utf-8")) as ApprovedKbEntry[];
  } catch {
    return [];
  }
}

function writeEntries(entries: ApprovedKbEntry[]): void {
  fs.writeFileSync(APPROVED_KB_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function appendApprovedKbEntry(
  entry: Omit<ApprovedKbEntry, "id" | "status" | "approvedForKb">
): ApprovedKbEntry {
  const newEntry: ApprovedKbEntry = {
    ...entry,
    id: randomUUID(),
    approvedForKb: true,
    status: "pending_ingest",
  };
  const entries = readEntries();
  entries.push(newEntry);
  writeEntries(entries);
  return newEntry;
}

export function getPendingEntries(): ApprovedKbEntry[] {
  return readEntries().filter((e) => e.status === "pending_ingest");
}

export function getAllApprovedEntries(): ApprovedKbEntry[] {
  return readEntries();
}

export function reviewLevelToRisk(
  reviewLevel?: string
): "low" | "medium" | "high" {
  if (reviewLevel === "escalate_human") return "high";
  if (reviewLevel === "cautious_auto") return "medium";
  return "low";
}

export function inferDomain(topSources?: string[]): string {
  if (!topSources || topSources.length === 0) return "general";
  const first = topSources[0].toLowerCase();
  if (first.includes("visa") || first.includes("immigration")) return "visa";
  if (first.includes("english") || first.includes("language")) return "english_requirements";
  if (first.includes("bank") || first.includes("fund")) return "finances";
  if (first.includes("job") || first.includes("work")) return "student_life";
  if (first.includes("tuition") || first.includes("fee") || first.includes("cost")) return "finances";
  if (first.includes("cas") || first.includes("acceptance")) return "visa";
  if (first.includes("atas")) return "visa";
  if (first.includes("university") || first.includes("college") || first.includes("school")) return "institutions";
  if (first.includes("admission")) return "admissions";
  return "general";
}

export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
