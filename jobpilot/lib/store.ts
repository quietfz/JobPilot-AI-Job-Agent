'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  DiagnosisReport,
  InterviewSession,
  LearningTask,
  ResumeProfile,
  WeaknessGraph,
} from '@/lib/types';

interface AppState {
  resumeId: string | null;
  resumeText: string;
  profile: ResumeProfile | null;
  targetJobId: string | null;
  diagnosis: DiagnosisReport | null;
  sessions: InterviewSession[];
  weakness: WeaknessGraph;
  tasks: LearningTask[];
  /** 模型接入：builtin=服务端内置 Key；custom=用户自己的 DeepSeek Key（仅存本机） */
  aiKeyMode: 'builtin' | 'custom';
  customApiKey: string;

  setResume: (text: string, profile: ResumeProfile) => void;
  setDiagnosis: (report: DiagnosisReport | null) => void;
  setTargetJob: (jobId: string | null) => void;
  saveSession: (session: InterviewSession) => void;
  deleteSession: (id: string) => void;
  mergeWeakness: (patch: Record<string, number>) => void;
  addTasks: (tasks: LearningTask[]) => void;
  toggleTask: (id: string) => void;
  setAiSettings: (mode: 'builtin' | 'custom', key?: string) => void;
  resetAll: () => void;
}

const empty = {
  resumeId: null,
  resumeText: '',
  profile: null,
  targetJobId: null,
  diagnosis: null,
  sessions: [] as InterviewSession[],
  weakness: {} as WeaknessGraph,
  tasks: [] as LearningTask[],
  aiKeyMode: 'builtin' as 'builtin' | 'custom',
  customApiKey: '',
};

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      ...empty,

      setResume: (text, profile) =>
        set((s) => ({
          resumeText: text,
          profile,
          resumeId: `${Date.now()}`,
          diagnosis:
            s.diagnosis && s.resumeText === text ? s.diagnosis : null,
        })),

      setDiagnosis: (report) => set({ diagnosis: report }),
      setTargetJob: (jobId) => set({ targetJobId: jobId }),

      saveSession: (session) =>
        set((s) => {
          const exists = s.sessions.some((x) => x.id === session.id);
          return {
            sessions: exists
              ? s.sessions.map((x) => (x.id === session.id ? session : x))
              : [session, ...s.sessions],
          };
        }),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      mergeWeakness: (patch) =>
        set((s) => {
          const next = { ...s.weakness };
          for (const [dim, value] of Object.entries(patch)) {
            const prev = next[dim];
            next[dim] = {
              score: prev ? Math.round(prev.score * 0.6 + value * 0.4) : Math.round(value),
              history: [...(prev?.history ?? []), Math.round(value)].slice(-8),
            };
          }
          return { weakness: next };
        }),

      addTasks: (tasks) =>
        set((s) => {
          const existing = new Set(s.tasks.map((t) => t.title));
          return { tasks: [...tasks.filter((t) => !existing.has(t.title)), ...s.tasks] };
        }),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),

      setAiSettings: (mode, key) =>
        set((s) => ({ aiKeyMode: mode, customApiKey: key ?? s.customApiKey })),

      // 清除业务数据，但保留模型接入设置
      resetAll: () =>
        set((s) => ({ ...empty, aiKeyMode: s.aiKeyMode, customApiKey: s.customApiKey })),
    }),
    {
      name: 'jobpilot-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export function useHydrated() {
  return useApp.persist.hasHydrated();
}

/** 随 API 请求发送的自定义 Key；内置模式或未填写时返回 undefined（服务端回退到内置 Key） */
export function getClientApiKey(): string | undefined {
  const s = useApp.getState();
  const k = s.customApiKey.trim();
  return s.aiKeyMode === 'custom' && k ? k : undefined;
}
