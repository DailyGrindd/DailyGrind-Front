import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { 
  User, Trophy, Target, Medal, Award, BarChart3, Calendar, ArrowLeft
} from "lucide-react";
import { Button } from "../components/button";
import { getPublicProfile } from "../services/userSearchService";
import type { PublicProfileData } from "../types/profile";

type TabType = "badges" | "achievements" | "statistics";


export function PublicProfile() {
  const { userName } = useParams<{ userName: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("badges");
  const navigate = useNavigate();

    //buscar y cargar el perfil público al montar el componente o cambiar userName
   useEffect(() => {
    fetchPublicProfile();
  }, [userName]);

   const fetchPublicProfile = async () => {
    if (!userName) {
      setError("Usuario no encontrado");
      setLoading(false);
      return;
    }// si no hay userName, no hacer nada
    // llamar al servicio para obtener el perfil público
    try {
        setLoading(true);
        const profileData = await getPublicProfile(userName);
        setProfile(profileData);
    } catch (err: any) {
        setError(err.response?.data?.error || "Error al cargar el perfil público");
    } finally {
        setLoading(false);
    }
    };
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
        <Header currentView="" />
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
        <Header currentView="" />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const { user, badges, recentActivity } = profile;

  return (
    <div className="min-h-screen flex flex-col bg-background text-label">
      <Header currentView="" />

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Botón volver */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>

          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    {user.profile.avatarUrl ? (
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
              <p className="text-muted-foreground text-sm">@{user.userName}</p>

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
                  ? "bg-primary text-white"
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
                <h2 className="text-xl font-bold mb-2 text-foreground">Badges</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Obtenidos {badges.length} badges
                </p>

                {badges.length === 0 ? (
                  <div className="text-center py-12">
                    <Medal className="w-16 h-16 text-border mx-auto mb-4" />
                    <p className="text-muted-foreground">Este usuario aún no tiene badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {badges.map((badgeItem, index) => (
                      <div
                        key={index}
                        className="bg-background rounded-xl p-6 text-center border border-border hover:border-primary/30 transition hover:shadow-md"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-card border border-border flex items-center justify-center">
                          {badgeItem.badge.iconUrl ? (
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
                <h2 className="text-xl font-bold mb-2 text-foreground">Logros</h2>
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
                      <Medal className="w-8 h-8 text-orange-500" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days.globalCompleted}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Desafíos globales</p>
                  </div>

                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-8 h-8 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days.personalCompleted}</span>
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