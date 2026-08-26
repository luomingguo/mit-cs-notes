import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface LearningPathNote {
  title: string;
  url: string;
}

export interface LearningPathStep {
  title: string;
  why: string;
  course: string;
  checkpoint: string;
  notes: LearningPathNote[];
}

export interface LearningPathRecord {
  slug: string;
  title: string;
  brief: string;
  summary: string;
  estimatedWeeks: number;
  prerequisites: string;
  steps: LearningPathStep[];
}

export interface LearningPathsData {
  generatedAt: string;
  paths: Record<string, LearningPathRecord>;
}

let learningPathsPromise: Promise<LearningPathsData> | null = null;

function projectRoot(): string {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    fileURLToPath(new URL('../../../', import.meta.url)),
  ];
  return candidates.find((candidate) => existsSync(path.join(candidate, 'public', 'rag-paths.json'))) ?? candidates[0];
}

function assertLearningPaths(value: unknown): asserts value is LearningPathsData {
  if (!value || typeof value !== 'object') throw new Error('rag-paths.json 必须是对象。');
  const candidate = value as Partial<LearningPathsData>;
  if (typeof candidate.generatedAt !== 'string' || !candidate.paths || typeof candidate.paths !== 'object') {
    throw new Error('rag-paths.json 缺少 generatedAt 或 paths。');
  }
  for (const [key, route] of Object.entries(candidate.paths)) {
    if (!route || typeof route !== 'object' || route.slug !== key || !Array.isArray(route.steps)) {
      throw new Error(`rag-paths.json 中的路径 ${key} 结构无效。`);
    }
    for (const [index, step] of route.steps.entries()) {
      if (!Array.isArray(step.notes)) throw new Error(`学习路径 ${key} 的第 ${index + 1} 步缺少 notes。`);
      for (const note of step.notes) {
        if (typeof note.title !== 'string' || typeof note.url !== 'string' || !note.url.startsWith('/zh/')) {
          throw new Error(`学习路径 ${key} 的第 ${index + 1} 步包含无效笔记链接。`);
        }
      }
    }
  }
}

export function loadLearningPaths(): Promise<LearningPathsData> {
  learningPathsPromise ??= (async () => {
    const source = path.join(projectRoot(), 'public', 'rag-paths.json');
    const data: unknown = JSON.parse(await readFile(source, 'utf8'));
    assertLearningPaths(data);
    return data;
  })();
  return learningPathsPromise;
}
