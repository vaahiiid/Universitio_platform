export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  domain: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  sample_questions: string[];
  answer_variants: string[];
}

export interface VectorStoreEntry {
  id: string;
  title: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  answer: string;
  embedding: number[];
}
