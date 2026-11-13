export type Severity = 'high' | 'medium' | 'low';

export interface EducationItem {
  school: string;
  major: string;
  degree: string;
  period: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface ProjectItem {
  name: string;
  role: string;
  period: string;
  bullets: string[];
}

export interface ResumeProfile {
  name: string;
  targetRole: string;
  education: EducationItem[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  certificates: string[];
  summary: string;
}

export interface DiagnosisIssue {
  id: string;
  severity: Severity;
  dimension: string;
  title: string;
  detail: string;
  resumeQuote: string;
  jobQuote: string;
  suggestion: string;
}

export interface DimensionScore {
  key: string;
  label: string;
  score: number;   // 0-100 的百分制得分
  max: number;     // 该维度满分
  raw: number;     // 实际得分（不超过 max）
}

export interface DiagnosisReport {
  score: number;
  dimensions: DimensionScore[];
  issues: DiagnosisIssue[];
  summary: string;
  jobId: string;
  jobTitle: string;
}

export interface JobRequirement {
  id: string;
  text: string;
  type: 'must' | 'plus';
  skill: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  companyType: string;
  location: string;
  level: string;
  salary: string;
  skills: string[];
  responsibilities: string[];
  requirements: JobRequirement[];
}

export type MatchState = 'hit' | 'partial' | 'gap';

export interface MatchItem {
  requirementId: string;
  text: string;
  jobQuote: string;
  resumeQuote: string;
  score: number;
  state: MatchState;
  reason: string;
}

export interface MatchResult {
  jobId: string;
  score: number;
  hits: MatchItem[];
  partials: MatchItem[];
  gaps: MatchItem[];
}

export interface TurnScore {
  relevance: number;
  evidence: number;
  depth: number;
  structure: number;
  reflection: number;
  total: number;
  reasons: string[];
  evidenceQuote: string;
}

export type SessionState =
  | 'intro'
  | 'warmup'
  | 'deep_dive'
  | 'stress'
  | 'candidate_qa'
  | 'end';

export interface InterviewTurn {
  id: string;
  index: number;
  role: 'interviewer' | 'candidate';
  content: string;
  score?: TurnScore;
  targetDimension?: string;
  probeReason?: string;
}

export interface InterviewSession {
  id: string;
  jobId: string;
  createdAt: number;
  state: SessionState;
  turns: InterviewTurn[];
  weakness: Record<string, number>;
  maxRounds: number;
  finished: boolean;
  mode: 'text' | 'voice';
}

export interface LearningTask {
  id: string;
  dimension: string;
  title: string;
  detail: string;
  resources: { title: string; source: string }[];
  done: boolean;
  createdAt: number;
}

export interface WeaknessNode {
  score: number;
  history: number[];
}

export type WeaknessGraph = Record<string, WeaknessNode>;

export interface LearningResource {
  id: string;
  title: string;
  dimension: string;
  tags: string[];
  source: string;
  content: string;
}
