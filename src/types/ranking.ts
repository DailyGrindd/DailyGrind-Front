// Tipos para el ranking
export interface RankingUser {
    rank: number;
    userId?: string;
    displayName: string;
    avatarUrl: string;
    zone?: string;
    level: number;
    totalPoints: number;
    totalCompleted: number;
    isCurrentUser?: boolean;
}

export interface GlobalRankingResponse {
    totalUsers: number;
    page: number;
    limit: number;
    rankings: RankingUser[];
    totalPages: number;
}

export interface MyGlobalPositionResponse {
    myPosition: RankingUser;
    nearby: RankingUser[];
    totalUsers: number;
}

export interface ZoneRankingResponse {
    zone: string;
    totalUsersInZone: number;
    page: number;
    limit: number;
    totalPages: number;
    rankings: RankingUser[];
}

export interface MyZonePositionResponse {
    zone: string;
    myPosition: RankingUser;
    nearby: RankingUser[];
    totalUsersInZone: number;
}