export interface Challenge {
    _id: string;
    type: "global" | "personal";
    ownerUser?: string | {
        _id: string;
        userName: string;
        profile?: {
            displayName: string;
            avatarUrl?: string;
        };
    };
    title: string;
    description: string;
    category: ChallengeCategory;
    difficulty: 1 | 2 | 3; // 1: Fácil, 2: Medio, 3: Difícil
    points: number;
    isActive: boolean;
    tags?: string[];
    requirements: {
        minLevel: number;
        preRequisiteChallenge?: string;
    };
    rules: {
        maxPerDay: number;
        minUserLevel: number;
    };
    stats: {
        timesAssigned: number;
        timesCompleted: number;
        completionRate: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export type ChallengeCategory = 
    | "Ejercicio Físico"
    | "Alimentación Saludable"
    | "Hidratación"
    | "Descanso"
    | "Salud Mental"
    | "Hábitos Diarios";

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
    "Ejercicio Físico",
    "Alimentación Saludable",
    "Hidratación",
    "Descanso",
    "Salud Mental",
    "Hábitos Diarios"
];

export interface CreateChallengeRequest {
    type: "personal";
    title: string;
    description: string;
    category: ChallengeCategory;
    difficulty: 1 | 2 | 3;
    tags?: string[];
    isActive?: boolean;
    minLevel?: number;
    maxPerDay?: number;
    minUserLevel?: number;
}

export interface UpdateChallengeRequest {
    title?: string;
    description?: string;
    category?: ChallengeCategory;
    difficulty?: 1 | 2 | 3;
    tags?: string[];
    isActive?: boolean;
    minLevel?: number;
    maxPerDay?: number;
    minUserLevel?: number;
}

export const getDifficultyPoints = (difficulty: 1 | 2 | 3): number => {
    const pointsMap = {
        1: 10, // Fácil
        2: 20, // Medio
        3: 30  // Difícil
    };
    return pointsMap[difficulty];
};

export const getDifficultyLabel = (difficulty: 1 | 2 | 3): string => {
    const labelMap = {
        1: "Fácil",
        2: "Medio",
        3: "Difícil"
    };
    return labelMap[difficulty];
};
