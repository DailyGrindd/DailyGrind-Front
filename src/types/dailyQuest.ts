import type { Challenge } from "./challenge";

export type MissionStatus = "pending" | "completed" | "skipped";
export type MissionType = "global" | "personal";

export interface Mission {
    slot: number;
    challengeId: string | Challenge;
    type: MissionType;
    status: MissionStatus;
    completedAt: Date | null;
    pointsAwarded: number;
}

export interface DailyQuest {
    _id: string;
    userId: string;
    date: Date;
    missions: Mission[];
    rerollCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AssignPersonalChallengeRequest {
    challengeId: string;
    slot: number; // 4 o 5
}

export interface DailyQuestStats {
    days: number;
    totalCompleted: number;
    totalPoints: number;
    totalSkipped: number;
    averagePerDay: string;
}

export interface HistoryResponse {
    history: DailyQuest[];
    stats: DailyQuestStats;
}

export interface CompleteMissionResponse {
    message: string;
    pointsEarned: number;
    dailyQuest: DailyQuest;
    userStats: {
        totalPoints: number;
        weeklyPoints: number;
        totalCompleted: number;
        currentStreak: number;
    };
}

export interface StatsPerDay {
    totalSkipped: number;
    totalPending: number;
    totalCompleted: number;
    averageSkipped: string;
    averagePending: string;
    averageCompleted: string;
    period: string;
}

export interface MissionsTypeStats {
    global: {
        total: number;
        completed: number;
        percentageCompleted: string;
    };
    personal: {
        total: number;
        completed: number;
        percentageCompleted: string;
    };
}
