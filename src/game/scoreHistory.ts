export type MathOperation = 'addition' | 'soustraction' | 'multiplication' | 'division';

export interface ScoreHistoryEntry {
    operation: MathOperation;
    level: number;
    score: number;
    totalQuestions: number;
    createdAt: string;
}

export const SCORE_HISTORY_KEY = 'math-adventure-score-history';

export const OPERATION_LABELS: Record<MathOperation, string> = {
    addition: 'Additions',
    soustraction: 'Soustractions',
    multiplication: 'Multiplications',
    division: 'Divisions'
};

const hasStorage = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

export const getScoreHistory = (): ScoreHistoryEntry[] => {
    if (!hasStorage()) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(SCORE_HISTORY_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as ScoreHistoryEntry[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const addScoreHistory = (entry: ScoreHistoryEntry): void => {
    if (!hasStorage()) {
        return;
    }

    const current = getScoreHistory();
    const updated = [entry, ...current].slice(0, 20);
    window.localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(updated));
};