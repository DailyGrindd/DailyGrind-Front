import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../components/header";
import { 
  User, Trophy, Target, Flame, Share2, Settings, Award, 
  BarChart3, Medal, Calendar, X, Check, Globe, Lock, Loader2 
} from "lucide-react";
import { Button } from "../components/button";  
import { Select } from "../components/select";
import type { RootState } from "../store/store";
import { checkSessionThunk } from "../store/authSlice";
import { Input } from "../components/input";
import { getMyProfile, updateProfile } from "../services/profileService";
import type {UserProfile, EditProfileForm} from "../types/profile";
import { Label } from "../components/label";


type TabType =  "achievements" | "statistics";

const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Rocky",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sadie"
];

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("achievements");
  const [levelInfo, setLevelInfo] = useState<any>(null);
  
  // Estados para avatar picker
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditProfileForm>({
    displayName: "",
    avatarUrl: "",
    zone: "",
    isPublic: true
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Estado para el toast de compartir
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email);

  useEffect(() => {
    fetchProfile();
    fetchLevelInfo();
  }, [navigate, userEmail]);

  const fetchProfile = async () => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const profileData = await getMyProfile(userEmail);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar el perfil");
      if (err.response?. status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelInfo = async () => {
    try {
      const { instanceAxios } = await import("../api/axios");
      const response = await instanceAxios.get("/users/level/info");
      console.log("Level Info Response:", response.data);
      setLevelInfo(response.data.levelInfo);
    } catch (error) {
      console.error("Error loading level info:", error);
    }
  };

  // Función para compartir perfil
  const handleShareProfile = async () => {
    if (!profile) return;
    if (!profile.user.profile.isPublic) {
      alert("Tu perfil es privado. Cámbialo a público para poder compartirlo.");
      return;
    }
    const profileUrl = `${window.location.origin}/profile/public/${profile.user.id}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
    } catch (err) {
      alert("No se pudo copiar el enlace");
      return;
    }
    setShowCopiedToast(true);
    setTimeout(() => setShowCopiedToast(false), 3000);
  };

  // Función para abrir el modal de edición
  const openEditModal = () => {
    if (profile) {
      setEditForm({
        displayName: profile.user.profile. displayName || "",
        avatarUrl: profile.user.profile.avatarUrl || "",
        zone: profile.user.profile.zone || "",
        isPublic: profile.user.profile.isPublic ?? true
      });
      setSelectedAvatar(profile.user.profile.avatarUrl || AVATAR_OPTIONS[0]);
    }
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // Función para enviar la edición del perfil
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    if (!userEmail) {
      setEditError("Email de usuario no disponible");
      setEditLoading(false);
      return;
    }
    try {
      const updatedData = {
        ...editForm,
        avatarUrl: selectedAvatar
      };
      
      await updateProfile(userEmail, updatedData);
      // Actualizar el estado local
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            profile: {
              ...profile.user.profile,
              displayName: updatedData.displayName,
              avatarUrl: updatedData.avatarUrl,
              zone: updatedData.zone,
              isPublic: updatedData.isPublic
            }
          }
        });
      }
      
      // Actualizar el estado global de auth para que el header se actualice
      dispatch(checkSessionThunk());
      
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.response?.data?. error || "Error al actualizar el perfil");
    } finally {
      setEditLoading(false);
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
      <Header currentView={location.pathname. includes("profile") ? "profile" : ""} />

      {/* Toast de copiado */}
      {showCopiedToast && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-accent text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>¡Link copiado al portapapeles! </span>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Editar Perfil</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-background rounded-lg transition"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Nombre de perfil */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nombre de perfil
                </label>
                <Input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e. target.value })}
                  placeholder="Tu nombre de perfil"
                  required
                  minLength={2}
                />
              </div>

              {/* Selector de Avatar */}
              <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                      <img
                          src={selectedAvatar}
                          alt="Avatar actual"
                          className="w-20 h-20 rounded-full border-4 border-purple-200"
                      />
                      <Button
                          type="button"
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          variant="outline"
                      >
                          {showAvatarPicker ? "Cerrar" : "Cambiar Avatar"}
                      </Button>
                  </div>

                  {/* Grid de avatares */}
                  {showAvatarPicker && (
                      <div className="grid grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
                          {AVATAR_OPTIONS.map((avatarUrl, index) => (
                              <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                      setSelectedAvatar(avatarUrl);
                                      setShowAvatarPicker(false);
                                  }}
                                  className={`w-16 h-16 rounded-full transition-all hover:scale-110 ${
                                      selectedAvatar === avatarUrl 
                                          ? "ring-4 ring-purple-500 scale-110" 
                                          : "hover:ring-2 hover:ring-purple-300"
                                  }`}
                              >
                                  <img
                                      src={avatarUrl}
                                      alt={`Avatar ${index + 1}`}
                                      className="w-full h-full rounded-full"
                                  />
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              
              {/* Zona */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Provincia
                </label>
                <Select
                  value={editForm.zone}
                  onChange={(e) => setEditForm({ ...editForm, zone: e.target.value })}
                  required
                >
                  <option value="">Selecciona tu provincia</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="Catamarca">Catamarca</option>
                  <option value="Chaco">Chaco</option>
                  <option value="Chubut">Chubut</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Corrientes">Corrientes</option>
                  <option value="Entre Ríos">Entre Ríos</option>
                  <option value="Formosa">Formosa</option>
                  <option value="Jujuy">Jujuy</option>
                  <option value="La Pampa">La Pampa</option>
                  <option value="La Rioja">La Rioja</option>
                  <option value="Mendoza">Mendoza</option>
                  <option value="Misiones">Misiones</option>
                  <option value="Neuquén">Neuquén</option>
                  <option value="Río Negro">Río Negro</option>
                  <option value="Salta">Salta</option>
                  <option value="San Juan">San Juan</option>
                  <option value="San Luis">San Luis</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Santa Fe">Santa Fe</option>
                  <option value="Santiago del Estero">Santiago del Estero</option>
                  <option value="Tierra del Fuego">Tierra del Fuego</option>
                  <option value="Tucumán">Tucumán</option>
                </Select>
              </div>

              {/* Perfil público/privado */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Visibilidad del perfil
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isPublic: true })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                      editForm.isPublic
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-background border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Público</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isPublic: false })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                      ! editForm.isPublic
                        ?  "bg-gray-100 border-gray-400 text-gray-700"
                        : "bg-background border-border text-muted-foreground hover:border-gray-400"
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">Privado</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {editForm.isPublic 
                    ? "Tu perfil será visible para otros usuarios" 
                    : "Solo tú podrás ver tu perfil"}
                </p>
              </div>

              {/* Error message */}
              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{editError}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            {/* Avatar y Nivel */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    {user. profile.avatarUrl ?  (
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
              <h1 className="text-2xl font-bold mt-6 text-foreground">{user.profile. displayName}</h1>

              {/* Badge público/privado */}
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                user.profile.isPublic
                  ?  "bg-green-100 text-green-700 border border-green-200"
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
                  <p className="text-2xl font-bold text-primary">{user. stats.totalCompleted}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>

              {/* Barra de nivel compacta */}
              {levelInfo && (
                <div className="mt-6 w-full max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium">Nivel {levelInfo.currentLevel}</span>
                    <span>{levelInfo.currentLevelPoints}/{levelInfo.pointsRequiredForNextLevel} XP</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-accent via-primary to-secondary transition-all duration-500"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 mt-6">
                <Button className="gap-2" onClick={openEditModal}>
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleShareProfile}>
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
                <p className="text-2xl font-bold text-yellow-500">{dailyProgress.summary. pending}</p>
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
                      ? (dailyProgress.summary. completed / dailyProgress.summary.total) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 bg-card p-1 rounded-lg border border-border shadow-sm">
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
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days. totalPointsEarned}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Puntos ganados</p>
                  </div>

                  <div className="bg-background rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="w-8 h-8 text-orange-500" />
                      <span className="text-2xl font-bold text-foreground">{recentActivity.last30Days. globalCompleted}</span>
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
                    <span className="text-xl font-bold text-foreground">{user. stats.totalPoints. toLocaleString()}</span>
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
                    <span className="text-xl font-bold text-primary">{user.stats. totalCompleted}</span>
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