
export interface UserProfile {
  user: {
    id: string;
    userName: string;
    email: string;
    role: string;
    level: number;
    profile: {
      displayName: string;
      avatarUrl?: string;
      isPublic: boolean;
      zone: string;
    };
    stats: {
      totalPoints: number;
      weeklyPoints: number;
      totalCompleted: number;
      currentStreak: number;
    };
    lastActive: string;
    createdAt?: string;
  };
  badges: Array<{
    badge: {
      _id: string;
      name: string;
      description: string;
      iconUrl: string;
      difficulty: number;
    };
    earnedAt: string;
  }>;
  dailyProgress: {
    date: string;
    missions: Array<{
      slot: number;
      challengeId: any;
      type: string;
      status: string;
      completedAt?: string;
      pointsAwarded: number;
    }>;
    summary: {
      total: number;
      completed: number;
      pending: number;
      skipped: number;
    };
    rerollsUsed: number;
    canReroll: boolean;
  };
  recentActivity: {
    last30Days: {
      totalCompleted: number;
      globalCompleted: number;
      personalCompleted: number;
      totalPointsEarned: number;
    };
  };
}

export interface EditProfileForm {
  displayName: string;
  avatarUrl: string;
  zone: string;
  isPublic: boolean;
}

