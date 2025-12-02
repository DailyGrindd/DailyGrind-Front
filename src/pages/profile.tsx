import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Header } from "../components/header";
import { User, Trophy, Target, Flame, Share2, Settings, Award, BarChart3, Medal, Calendar } from "lucide-react";
import { instanceAxios } from "../api/axios";
import { Button } from "../components/button";
import type { RootState } from "../store/store";

interface UserProfile {
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

type TabType = "badges" | "achievements" | "statistics";

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("badges");
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userEmail) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await instanceAxios.get(`/profile/${userEmail}`);
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Error al cargar el perfil");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, userEmail]);

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["Común", "Poco común", "Raro", "Épico", "Legendario"];
    return labels[difficulty - 1] || "Común";
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = [
      "text-gray-500",
      "text-green-600",
      "text-blue-600",
      "text-purple-600",
      "text-yellow-600"
    ];
    return colors[difficulty - 1] || "text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-label">
        <Header currentView="profile" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Cargando perfil...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-label">
        <Header currentView="profile" />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const { user, badges, dailyProgress, recentActivity } = profile;

  return (
    <div className="min-h-screen flex flex-col bg-background text-label">
      <Header currentView={location.pathname.includes("profile") ? "profile" : ""} />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            {/* Avatar y Nivel */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    {user.profile.avatarUrl ?  (
                      <img
                        src={user.profile.avatarUrl}
                        alt={user.profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {/* Badge de nivel */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  {user.level}
                </div>
              </div>

              {/* Nombre */}
              <h1 className="text-2xl font-bold mt-6 text-foreground">{user.profile.displayName}</h1>

              {/* Badge público/privado */}
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.profile.isPublic
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}>
                {user. profile.isPublic ? "Perfil Público" : "Perfil Privado"}
              </span>

              {/* Info adicional */}
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Nivel {user.level} • {user.profile.zone}
              </p>

              {/* Stats principales */}
              <div className="flex gap-8 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{user.stats.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">{user.stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{user.stats.totalCompleted}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6">
                <Button className="gap-2">
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Compartir Perfil
                </Button>
              </div>
            </div>
          </div>

          {/* Progreso diario */}
          <div className="bg-card border border-border rounded-2xl p-6 mt-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Target className="w-5 h-5 text-accent" />
              Progreso de Hoy
            </h2>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 text-center border border-border">
                <p className="text-2xl font-bold text-foreground">{dailyProgress.summary.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center border border-border">
                <p className="text-2xl font-bold text-accent">{dailyProgress.summary.completed}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center border border-border">
                <p className="text-2xl font-bold text-yellow-500">{dailyProgress.summary.pending}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center border border-border">
                <p className="text-2xl font-bold text-muted-foreground">{dailyProgress. summary.skipped}</p>
                <p className="text-xs text-muted-foreground">Saltados</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progreso diario</span>
                <span>{dailyProgress.summary.total > 0
                  ? Math.round((dailyProgress.summary.completed / dailyProgress.summary.total) * 100)
                  : 0}%</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-500"
                  style={{
                    width: `${dailyProgress.summary.total > 0
                      ? (dailyProgress.summary.completed / dailyProgress.summary.total) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 bg-card p-1 rounded-lg border border-border shadow-sm">
            <button
              onClick={() => setActiveTab("badges")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "badges"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              <Medal className="w-4 h-4 inline mr-2" />
              Badges
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "achievements"
                  ?  "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Logros
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "statistics"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Estadísticas
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "badges" && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-2 text-foreground">Tus Badges</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Obtenidos {badges.length} badges
                </p>

                {badges.length === 0 ?  (
                  <div className="text-center py-12">
                    <Medal className="w-16 h-16 text-border mx-auto mb-4" />
                    <p className="text-muted-foreground">Aún no tienes badges</p>
                    <p className="text-muted-foreground text-sm mt-2">¡Completa desafíos para ganar badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badgeItem, index) => (
                      <div
                        key={index}
                        className="bg-background rounded-xl p-6 text-center border border-border hover:border-primary/30 transition hover:shadow-md"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border border-border flex items-center justify-center">
                          {badgeItem.badge.iconUrl ?  (
                            <img src={badgeItem.badge.iconUrl} alt={badgeItem.badge.name} className="w-10 h-10" />
                          ) : (
                            <Trophy className="w-8 h-8 text-secondary" />
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground">{badgeItem.badge.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{badgeItem.badge.description}</p>
                        <span className={`inline-block mt-3 text-xs font-medium ${getDifficultyColor(badgeItem.badge.difficulty)}`}>
                          {getDifficultyLabel(badgeItem.badge.difficulty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-2 text-foreground">Tus Logros</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Actividad de los últimos 30 días
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-8 h-8 text-accent" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days.totalCompleted}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Desafíos completados</p>
                  </div>

                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days.totalPointsEarned}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Puntos ganados</p>
                  </div>

                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="w-8 h-8 text-orange-500" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days.globalCompleted}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Desafíos globales</p>
                  </div>

                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days. personalCompleted}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Desafíos personales</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "statistics" && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-foreground">Estadísticas Generales</h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Nivel actual</span>
                    <span className="text-xl font-bold text-accent">{user.level}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Puntos totales</span>
                    <span className="text-xl font-bold text-foreground">{user.stats.totalPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Puntos esta semana</span>
                    <span className="text-xl font-bold text-secondary">{user.stats.weeklyPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Racha actual</span>
                    <span className="text-xl font-bold text-orange-500">{user.stats.currentStreak} días</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Total completados</span>
                    <span className="text-xl font-bold text-primary">{user.stats.totalCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background rounded-lg border border-border">
                    <span className="text-muted-foreground">Badges obtenidos</span>
                    <span className="text-xl font-bold text-yellow-500">{badges.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}