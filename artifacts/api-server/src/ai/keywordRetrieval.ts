/**
 * BM25-inspired retrieval with sample_question boosting.
 * Works without any API calls — reads directly from knowledge_base.json.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { KnowledgeBaseEntry } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "knowledge_base.json");

const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","all","can","her","was","one",
  "our","out","day","get","has","him","his","how","its","let","may","see",
  "too","use","way","who","did","from","had","have","they","this","that",
  "with","will","your","about","been","does","more","also","than","into",
  "what","when","then","some","each","such","like","very","just","know",
  "take","make","good","well","could","would","there","their","which",
  "these","those","after","before","should","tell","want","need","list",
  "best","top","most","describe","give","show","many","much","any","few",
  "two","three","five","ten","etc","to","do","is","it","at","an","on",
  "my","me","us","we","if","in","of","or","be","by","am","no","so",
]);

const TOKEN_NORMALISE: Record<string, string> = {
  dependants: "dependent", dependant: "dependent", dependents: "dependent",
  family: "dependent", families: "dependent",
  universities: "university", colleges: "college", schools: "school",
  requirements: "requirement", visas: "visa", documents: "document",
  courses: "course", programmes: "programme", programs: "programme",
  students: "student", applications: "application", letters: "letter",
  fees: "fee", costs: "cost", rules: "rule", months: "month",
  qualifications: "qualification", institutions: "institution",
};

function normalise(token: string): string {
  return TOKEN_NORMALISE[token] ?? token;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
    .map(normalise);
}

interface IndexedEntry {
  id: string;
  title: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  answer: string;
  sample_questions: string[];
  titleTokens: string[];
  questionTokens: string[][];
  answerTokens: string[];
  allTokens: string[];
  termFreq: Map<string, number>;
}

interface Index {
  entries: IndexedEntry[];
  idf: Map<string, number>;
  N: number;
}

let _index: Index | null = null;

function buildIndex(): Index {
  const kb: KnowledgeBaseEntry[] = JSON.parse(
    fs.readFileSync(KB_PATH, "utf-8")
  );

  const entries: IndexedEntry[] = kb.map((e) => {
    const titleTokens = tokenize(e.title);
    const questionTokens = e.sample_questions.map(tokenize);
    const answerTokens = tokenize(e.answer_variants[0] ?? "");
    const allTokens = [
      ...titleTokens,
      ...questionTokens.flat(),
      ...answerTokens,
    ];
    const termFreq = new Map<string, number>();
    for (const t of allTokens) {
      termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
    }
    return {
      id: e.id,
      title: e.title,
      risk_level: e.risk_level,
      needs_human_review: e.needs_human_review,
      answer: e.answer_variants[0] ?? "",
      sample_questions: e.sample_questions,
      titleTokens,
      questionTokens,
      answerTokens,
      allTokens,
      termFreq,
    };
  });

  const N = entries.length;
  const df = new Map<string, number>();
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const t of entry.allTokens) {
      if (!seen.has(t)) {
        df.set(t, (df.get(t) ?? 0) + 1);
        seen.add(t);
      }
    }
  }

  const idf = new Map<string, number>();
  for (const [term, count] of df) {
    idf.set(term, Math.log((N - count + 0.5) / (count + 0.5) + 1));
  }

  return { entries, idf, N };
}

function getIndex(): Index {
  if (!_index) _index = buildIndex();
  return _index;
}

const BM25_K1 = 1.5;
const BM25_B = 0.75;

function bm25Score(
  queryTokens: string[],
  entry: IndexedEntry,
  avgDocLen: number,
  idf: Map<string, number>
): number {
  const docLen = entry.allTokens.length;
  let score = 0;

  for (const qt of queryTokens) {
    const tf = entry.termFreq.get(qt) ?? 0;
    if (tf === 0) continue;
    const idfVal = idf.get(qt) ?? 0;
    const tfNorm =
      (tf * (BM25_K1 + 1)) /
      (tf + BM25_K1 * (1 - BM25_B + BM25_B * (docLen / avgDocLen)));
    score += idfVal * tfNorm;
  }

  return score;
}

function sampleQuestionBoost(
  queryTokens: string[],
  questionTokens: string[][]
): number {
  if (queryTokens.length === 0) return 0;
  let best = 0;
  for (const qTokens of questionTokens) {
    if (qTokens.length === 0) continue;
    const qSet = new Set(qTokens);
    const hits = queryTokens.filter((t) => qSet.has(t)).length;
    const precision = hits / queryTokens.length;
    const recall = hits / qTokens.length;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    if (f1 > best) best = f1;
  }
  return best * 3.0;
}

function exactAcronymBoost(query: string, entry: IndexedEntry): number {
  const q = query.trim().toUpperCase();
  const fullDoc = [entry.title, ...entry.sample_questions, entry.answer].join(" ");
  const pattern = new RegExp(`\\b${q}\\b`, "g");
  const matches = (fullDoc.match(pattern) ?? []).length;
  return matches > 0 ? Math.log(matches + 1) * 2 : 0;
}

export interface KeywordRetrievedEntry {
  id: string;
  title: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  answer: string;
  score: number;
}

export function retrieveByKeyword(
  query: string,
  topK = 3,
  minScore = 0.001
): KeywordRetrievedEntry[] {
  const { entries, idf } = getIndex();
  const totalDocLen = entries.reduce((s, e) => s + e.allTokens.length, 0);
  const avgDocLen = totalDocLen / entries.length;

  const queryTokens = tokenize(query);

  const isShortAcronym =
    query.trim().split(/\s+/).length <= 3 &&
    /^[A-Z]{2,6}/.test(query.trim());

  const scored = entries.map((entry) => {
    const base = bm25Score(queryTokens, entry, avgDocLen, idf);
    const qBoost = sampleQuestionBoost(queryTokens, entry.questionTokens);
    const acroBoost = isShortAcronym
      ? exactAcronymBoost(query, entry)
      : 0;

    return {
      id: entry.id,
      title: entry.title,
      risk_level: entry.risk_level,
      needs_human_review: entry.needs_human_review,
      answer: entry.answer,
      score: base + qBoost + acroBoost,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((e) => e.score >= minScore).slice(0, topK);

  const maxScore = top[0]?.score ?? 1;
  return top.map((e) => ({
    ...e,
    score: Math.round((e.score / maxScore) * 100) / 100,
  }));
}
