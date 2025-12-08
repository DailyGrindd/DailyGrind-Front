import { useState, useEffect } from "react";
import { Header } from "../components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card";
import { Button } from "../components/button";
import { 
    Trophy, 
    Flame, 
    RefreshCw, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Plus,
    Trash2,
    Calendar,
    TrendingUp,
    Zap,
    SkipForward,
    Star
} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { checkSessionThunk } from "../store/authSlice";
import type { DailyQuest, Mission } from "../types/dailyQuest";
import type { Challenge } from "../types/challenge";
import {
    initializeDailyQuest,
    getMyDailyQuest,
    assignPersonalChallenge,
    unassignPersonalChallenge,
    rerollGlobalMission,
    completeMission,
    skipMission,
} from "../services/dailyQuestServices";
import { getAllChallenges } from "../services/challengeServices";
import { getDifficultyLabel } from "../types/challenge";
import { useLocation } from "react-router-dom";

export function Daily() {
    const location = useLocation();
    const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challengeViewMode, setChallengeViewMode] = useState<"my" | "community">("my");
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [levelUpData, setLevelUpData] = useState<{ message: string; newLevel: number } | null>(null);
    
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<any>();

    useEffect(() => {
        loadDailyQuest();
        const interval = setInterval(updateTimeRemaining, 1000);
        return () => clearInterval(interval);
    }, []);

    const updateTimeRemaining = () => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    const loadDailyQuest = async () => {
        try {
            setLoading(true);
            const data = await getMyDailyQuest();
            
            // Tu backend siempre devuelve algo (DailyQuest existente o estructura vacía)
            // Solo setear el estado, NO auto-inicializar
            if (data) {
                setDailyQuest(data);
            } else {
                // Si por alguna razón no hay respuesta, setear null para mostrar botón
                setDailyQuest(null);
            }
        } catch (error: any) {
            // En caso de error, setear null para mostrar el botón de inicializar
            setDailyQuest(null);
            // Solo mostrar error si no es un 404 o similar
            if (error.response?.status !== 404) {
                toast.error(error.response?.data?.error || "Error al cargar misiones del día");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async () => {
        try {
            setLoading(true);
            
            if (!user) {
                toast.error("No hay usuario autenticado");
                return;
            }
            
            const response = await initializeDailyQuest();
            
            // Manejar diferentes estructuras de respuesta
            let dailyQuestData: DailyQuest;
            
            if (response.dailyQuest) {
                // Nuevo DailyQuest creado: { message, dailyQuest }
                dailyQuestData = response.dailyQuest;
            } else if ((response as any)._id && (response as any).missions !== undefined) {
                // DailyQuest existente devuelto directamente
                dailyQuestData = response as unknown as DailyQuest;
            } else {
                toast.error("Respuesta inválida del servidor");
                return;
            }
            
            setDailyQuest(dailyQuestData);
            
            // Verificar si tiene misiones globales
            const globalMissions = dailyQuestData.missions.filter(m => [1, 2, 3].includes(m.slot));
            
            if (globalMissions.length > 0) {
                toast.success(`¡${globalMissions.length} misiones globales generadas!`);
            } else {
                toast.info("DailyQuest inicializado. No hay desafíos globales disponibles para tu nivel.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message || 
                               error.message || 
                               "Error al inicializar misiones";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleReroll = async (slot: number) => {
        try {
            setLoading(true);
            const response = await rerollGlobalMission(slot);
            
            // Actualizar estado local con la respuesta
            if (response.dailyQuest) {
                setDailyQuest(response.dailyQuest);
            } else {
                // Fallback: recargar desde servidor
                await loadDailyQuest();
            }
            
            toast.success(`Misión renovada. Te quedan ${response.rerollsRemaining} rerolls`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al hacer reroll");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (slot: number) => {
        try {
            setLoading(true);
            const response = await completeMission(slot);
            
            // Actualizar estado local con la respuesta
            if (response.dailyQuest) {
                setDailyQuest(response.dailyQuest);
            } else {
                // Fallback: recargar desde servidor
                await loadDailyQuest();
            }
            
            // Mostrar notificación de misión completada
            let message = `¡Misión completada! +${response.pointsEarned} puntos`;
            
            toast.success(message + " 🎉");
            
            // Actualizar Redux para que el header se actualice
            await dispatch(checkSessionThunk());
            
            // Debug: Log de la respuesta completa
            console.log("📊 Respuesta completar misión:", {
                hasLevelUp: !!response.levelUp,
                levelInfo: response.levelInfo,
                fullResponse: response
            });
            
            // Verificar si hay level up
            if (response.levelUp) {
                const newLevel = response.levelInfo?.currentLevel || response.levelUp.newLevel || (user?.level || 1) + 1;
                
                console.log("🎉 LEVEL UP DETECTADO:", {
                    message: response.levelUp.message,
                    newLevel,
                    previousLevel: response.levelUp.previousLevel
                });
                
                setLevelUpData({
                    message: response.levelUp.message,
                    newLevel: newLevel
                });
                
                // Mostrar modal después de un breve delay
                setTimeout(() => {
                    console.log("📱 Mostrando modal de level up");
                    setShowLevelUpModal(true);
                }, 500);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al completar misión");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async (slot: number) => {
        try {
            setLoading(true);
            const response = await skipMission(slot);
            
            // Actualizar estado local con la respuesta
            if (response.dailyQuest) {
                setDailyQuest(response.dailyQuest);
            } else {
                // Fallback: recargar desde servidor
                await loadDailyQuest();
            }
            
            toast.info("Misión skipeada");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al skipear misión");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignModal = async (slot: number) => {
        setSelectedSlot(slot);
        setShowAssignModal(true);
        setChallengeViewMode("my"); // Comenzar con "mis desafíos"
        loadAvailableChallenges("my");
    };

    const loadAvailableChallenges = async (mode: "my" | "community") => {
        setLoadingChallenges(true);
        
        try {
            // Cargar todos los desafíos personales activos
            const challenges = await getAllChallenges({ 
                type: "personal", 
                isActive: true 
            });
            
            // Filtrar desafíos ya asignados
            const assignedIds = dailyQuest?.missions.map(m => 
                typeof m.challengeId === 'string' ? m.challengeId : m.challengeId._id
            ) || [];
            
            // Filtrar según el modo
            let filteredChallenges: Challenge[];
            if (mode === "my") {
                // Solo desafíos propios
                filteredChallenges = challenges.filter(challenge => {
                    if (typeof challenge.ownerUser === 'object' && challenge.ownerUser !== null) {
                        return challenge.ownerUser._id === user?._id;
                    }
                    return challenge.ownerUser === user?._id;
                });
            } else {
                // Solo desafíos de la comunidad (de otros usuarios)
                filteredChallenges = challenges.filter(challenge => {
                    if (typeof challenge.ownerUser === 'object' && challenge.ownerUser !== null) {
                        return challenge.ownerUser._id !== user?._id;
                    }
                    return challenge.ownerUser !== user?._id;
                });
            }
            
            // Excluir desafíos ya asignados
            const available = filteredChallenges.filter(c => !assignedIds.includes(c._id));
            setAvailableChallenges(available);
        } catch (error) {
            toast.error("Error al cargar desafíos");
        } finally {
            setLoadingChallenges(false);
        }
    };

    const handleAssignChallenge = async (challengeId: string) => {
        if (!selectedSlot) return;
        
        try {
            setLoading(true);
            
            // Si no hay DailyQuest, inicializar primero
            if (!dailyQuest) {
                await initializeDailyQuest();
                toast.info("Inicializando misiones del día...");
            }
            
            const response = await assignPersonalChallenge({
                challengeId,
                slot: selectedSlot
            });
            
            // Actualizar estado local con la respuesta
            if (response.dailyQuest) {
                setDailyQuest(response.dailyQuest);
            } else {
                // Fallback: recargar desde servidor
                await loadDailyQuest();
            }
            
            setShowAssignModal(false);
            setSelectedSlot(null);
            toast.success("¡Desafío asignado correctamente!");
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Error al asignar desafío";
            
            // Si el error es porque debe inicializar primero, hacerlo automáticamente
            if (errorMessage.includes("inicializar") || errorMessage.includes("DailyQuest")) {
                try {
                    await initializeDailyQuest();
                    
                    // Reintentar asignación
                    const retryResponse = await assignPersonalChallenge({
                        challengeId,
                        slot: selectedSlot
                    });
                    
                    // Actualizar estado local con la respuesta
                    if (retryResponse.dailyQuest) {
                        setDailyQuest(retryResponse.dailyQuest);
                    } else {
                        // Fallback: recargar desde servidor
                        await loadDailyQuest();
                    }
                    
                    setShowAssignModal(false);
                    setSelectedSlot(null);
                    toast.success("¡Desafío asignado correctamente!");
                } catch (retryError: any) {
                    toast.error(retryError.response?.data?.error || "Error al asignar desafío");
                }
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (slot: number) => {
        try {
            setLoading(true);
            const response = await unassignPersonalChallenge(slot);
            
            // Actualizar estado local con la respuesta
            if (response.dailyQuest) {
                setDailyQuest(response.dailyQuest);
            } else {
                // Fallback: recargar desde servidor
                await loadDailyQuest();
            }
            
            toast.success("Desafío desasignado");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al desasignar");
        } finally {
            setLoading(false);
        }
    };

    const getMissionChallenge = (mission: Mission): Challenge | null => {
        if (typeof mission.challengeId === 'object') {
            return mission.challengeId as Challenge;
        }
        return null;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "skipped":
                return <XCircle className="h-5 w-5 text-gray-400" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "border-green-500 bg-green-50";
            case "skipped":
                return "border-gray-300 bg-gray-50";
            default:
                return "border-primary bg-white";
        }
    };

    const getDifficultyColor = (difficulty: number) => {
        switch (difficulty) {
            case 1: return "text-green-500 bg-green-500/10";
            case 2: return "text-yellow-500 bg-yellow-500/10";
            case 3: return "text-red-500 bg-red-500/10";
            default: return "text-gray-500 bg-gray-500/10";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Ejercicio Físico": return "💪";
            case "Alimentación Saludable": return "🥗";
            case "Hidratación": return "💧";
            case "Descanso": return "😴";
            case "Salud Mental": return "🧠";
            case "Hábitos Diarios": return "📅";
            default: return "🎯";
        }
    };

    // Calcular estadísticas del día
    const completedMissions = (dailyQuest && dailyQuest._id && dailyQuest.missions) 
        ? dailyQuest.missions.filter(m => m.status === "completed").length 
        : 0;
    const totalPoints = (dailyQuest && dailyQuest._id && dailyQuest.missions) 
        ? dailyQuest.missions.reduce((sum, m) => sum + m.pointsAwarded, 0) 
        : 0;
    const completionRate = (dailyQuest && dailyQuest._id && dailyQuest.missions && dailyQuest.missions.length) 
        ? Math.round((completedMissions / dailyQuest.missions.length) * 100) 
        : 0;

    if (loading && !dailyQuest) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header currentView="daily" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Cargando...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header currentView={location.pathname.includes("daily") ? "daily" : ""} />
            
            <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                                <Calendar className="h-10 w-10 text-primary" />
                                Misiones Diarias
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Completa tus desafíos del día y gana puntos
                            </p>
                        </div>
                        
                        {/* Contador de tiempo restante */}
                        <Card className="bg-gradient-to-r from-primary to-accent text-white">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Clock className="h-6 w-6 mx-auto mb-2" />
                                    <p className="text-sm opacity-90">Tiempo restante</p>
                                    <p className="text-2xl font-bold">{timeRemaining}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Estadísticas del día */}
                    {(dailyQuest && dailyQuest._id) && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-foreground">{user?.level || 1}</p>
                                        <p className="text-sm text-muted-foreground">Nivel</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-foreground">{completedMissions}</p>
                                        <p className="text-sm text-muted-foreground">Completadas</p>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <Flame className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-foreground">{totalPoints}</p>
                                        <p className="text-sm text-muted-foreground">Puntos ganados</p>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
                                        <p className="text-sm text-muted-foreground">Progreso</p>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <RefreshCw className="h-8 w-8 text-primary mx-auto mb-2" />
                                        <p className="text-3xl font-bold text-foreground">{3 - (dailyQuest.rerollCount || 0)}</p>
                                        <p className="text-sm text-muted-foreground">Rerolls disponibles</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {(!dailyQuest || !dailyQuest._id) && (
                        <Card>
                            <CardContent className="pt-6 text-center py-12">
                                <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">¡Bienvenido a tu día!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Genera tus 3 misiones globales diarias y comienza a ganar puntos
                                </p>
                                <Button 
                                    size="lg" 
                                    onClick={handleInitialize}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <Zap className="h-5 w-5 mr-2" />
                                    )}
                                    {loading ? "Generando..." : "Generar Misiones"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Misiones */}
                    {(dailyQuest && dailyQuest._id) && (
                        <>
                            {/* Misiones Globales (Slots 1-3) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-primary" />
                                        Misiones Globales
                                    </CardTitle>
                                    <CardDescription>
                                        Misiones diarias generadas automáticamente. Puedes hacer reroll hasta 3 veces al día.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[1, 2, 3].map(slot => {
                                            const mission = dailyQuest.missions.find(m => m.slot === slot);
                                            const challenge = mission ? getMissionChallenge(mission) : null;
                                            
                                            return (
                                                <div 
                                                    key={slot}
                                                    className={`border-2 rounded-lg p-4 ${mission ? getStatusColor(mission.status) : 'border-dashed border-gray-300'}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{challenge ? getCategoryIcon(challenge.category) : "🎯"}</span>
                                                            <span className="font-semibold text-sm text-muted-foreground">Slot {slot}</span>
                                                        </div>
                                                        {mission && getStatusIcon(mission.status)}
                                                    </div>
                                                    
                                                    {challenge ? (
                                                        <>
                                                            <h3 className="font-bold text-foreground mb-2">{challenge.title}</h3>
                                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                                {challenge.description}
                                                            </p>
                                                            
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                                                    {getDifficultyLabel(challenge.difficulty)}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-primary font-bold">
                                                                    <Flame className="h-4 w-4" />
                                                                    <span>{challenge.points} pts</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {mission && mission.status === "pending" && (
                                                                <div className="flex gap-2">
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={() => handleComplete(slot)}
                                                                        disabled={loading}
                                                                        className="flex-1"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Completar
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline"
                                                                        onClick={() => handleReroll(slot)}
                                                                        disabled={loading || (dailyQuest.rerollCount >= 3)}
                                                                    >
                                                                        <RefreshCw className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        onClick={() => handleSkip(slot)}
                                                                        disabled={loading}
                                                                    >
                                                                        <SkipForward className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            
                                                            {mission && mission.status === "completed" && (
                                                                <div className="text-center text-green-600 font-semibold text-sm">
                                                                    ✓ Completada (+{mission.pointsAwarded} pts)
                                                                </div>
                                                            )}
                                                            
                                                            {mission && mission.status === "skipped" && (
                                                                <div className="text-center text-gray-500 text-sm">
                                                                    Skipeada
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-center text-muted-foreground">
                                                            <p className="text-sm">Sin misión</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Misiones Globales Desbloqueadas (Slots > 3 con type "global") */}
                            {dailyQuest.missions.some(m => m.slot > 3 && m.type === "global") && (
                                <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            Desafíos Desbloqueados
                                        </CardTitle>
                                        <CardDescription>
                                            Estos desafíos se desbloquearon al completar sus prerequisitos. ¡Sigue completando para desbloquear más!
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {dailyQuest.missions
                                                .filter(m => m.slot > 3 && m.type === "global")
                                                .sort((a, b) => a.slot - b.slot)
                                                .map(mission => {
                                                    const challenge = getMissionChallenge(mission);
                                                    
                                                    return (
                                                        <div 
                                                            key={mission.slot}
                                                            className={`border-2 rounded-lg p-4 relative ${getStatusColor(mission.status)}`}
                                                        >
                                                            {/* Badge de desbloqueo */}
                                                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold shadow-md flex items-center gap-1">
                                                                <Star className="h-3 w-3 fill-yellow-900" />
                                                                Slot {mission.slot}
                                                            </div>
                                                            
                                                            <div className="flex items-start justify-between mb-3 mt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl">{challenge ? getCategoryIcon(challenge.category) : "🎯"}</span>
                                                                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">🔓 Desbloqueado</span>
                                                                </div>
                                                                {getStatusIcon(mission.status)}
                                                            </div>
                                                            
                                                            {challenge ? (
                                                                <>
                                                                    <h3 className="font-bold text-foreground mb-2">{challenge.title}</h3>
                                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                                        {challenge.description}
                                                                    </p>
                                                                    
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                                                            {getDifficultyLabel(challenge.difficulty)}
                                                                        </span>
                                                                        <div className="flex items-center gap-1 text-primary font-bold">
                                                                            <Flame className="h-4 w-4" />
                                                                            <span>{challenge.points} pts</span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {mission.status === "pending" && (
                                                                        <div className="flex gap-2">
                                                                            <Button 
                                                                                size="sm" 
                                                                                onClick={() => handleComplete(mission.slot)}
                                                                                disabled={loading}
                                                                                className="flex-1"
                                                                            >
                                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                                Completar
                                                                            </Button>
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="ghost"
                                                                                onClick={() => handleSkip(mission.slot)}
                                                                                disabled={loading}
                                                                            >
                                                                                <SkipForward className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {mission.status === "completed" && (
                                                                        <div className="text-center text-green-600 font-semibold text-sm">
                                                                            ✓ Completada (+{mission.pointsAwarded} pts)
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {mission.status === "skipped" && (
                                                                        <div className="text-center text-gray-500 text-sm">
                                                                            Skipeada
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div className="text-center text-gray-500 text-sm py-8">
                                                                    Desafío no disponible
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Misiones Personales (Slots para desafíos personalizados) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-primary" />
                                        Misiones Personales
                                    </CardTitle>
                                    <CardDescription>
                                        Asigna tus propios desafíos personalizados. Puedes tener hasta 2 misiones personales activas.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Slots fijos 4 y 5 para personales */}
                                        {[4, 5].map(slot => {
                                            // Solo mostrar misiones que sean type "personal" o slots vacíos
                                            const mission = dailyQuest.missions.find(m => m.slot === slot && m.type === "personal");
                                            const challenge = mission ? getMissionChallenge(mission) : null;
                                            
                                            return (
                                                <div 
                                                    key={slot}
                                                    className={`border-2 rounded-lg p-4 ${mission ? getStatusColor(mission.status) : 'border-dashed border-gray-300 bg-gray-50'}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{challenge ? getCategoryIcon(challenge.category) : "📋"}</span>
                                                            <span className="font-semibold text-sm text-muted-foreground">Slot {slot}</span>
                                                        </div>
                                                        {mission && getStatusIcon(mission.status)}
                                                    </div>
                                                    
                                                    {challenge ? (
                                                        <>
                                                            <h3 className="font-bold text-foreground mb-2">{challenge.title}</h3>
                                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                                {challenge.description}
                                                            </p>
                                                            
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                                                    {getDifficultyLabel(challenge.difficulty)}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-primary font-bold">
                                                                    <Flame className="h-4 w-4" />
                                                                    <span>{challenge.points} pts</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {mission && mission.status === "pending" && (
                                                                <div className="flex gap-2">
                                                                    <Button 
                                                                        size="sm" 
                                                                        onClick={() => handleComplete(slot)}
                                                                        disabled={loading}
                                                                        className="flex-1"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Completar
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="outline"
                                                                        onClick={() => handleUnassign(slot)}
                                                                        disabled={loading}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="ghost"
                                                                        onClick={() => handleSkip(slot)}
                                                                        disabled={loading}
                                                                    >
                                                                        <SkipForward className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            
                                                            {mission && mission.status === "completed" && (
                                                                <div className="text-center text-green-600 font-semibold text-sm">
                                                                    ✓ Completada (+{mission.pointsAwarded} pts)
                                                                </div>
                                                            )}
                                                            
                                                            {mission && mission.status === "skipped" && (
                                                                <div className="text-center text-gray-500 text-sm">
                                                                    Skipeada
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <p className="text-sm text-muted-foreground mb-3">Slot disponible</p>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => handleOpenAssignModal(slot)}
                                                            >
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Asignar Desafío
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de asignación */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div 
                        className="fixed inset-0 bg-black/50 z-[9998]"
                        onClick={() => setShowAssignModal(false)}
                    />
                    
                    <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-3xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto z-[9999]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">
                                Selecciona un Desafío Personal
                            </h2>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-2 hover:bg-background rounded-lg transition"
                            >
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Pestañas para cambiar entre Mis Desafíos y Comunidad */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={challengeViewMode === "my" ? "default" : "outline"}
                                onClick={() => {
                                    setChallengeViewMode("my");
                                    loadAvailableChallenges("my");
                                }}
                                className="flex-1"
                            >
                                Mis Desafíos
                            </Button>
                            <Button
                                variant={challengeViewMode === "community" ? "default" : "outline"}
                                onClick={() => {
                                    setChallengeViewMode("community");
                                    loadAvailableChallenges("community");
                                }}
                                className="flex-1"
                            >
                                De la Comunidad
                            </Button>
                        </div>
                        
                        {loadingChallenges ? (
                            <div className="text-center py-8">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-muted-foreground">Cargando desafíos...</p>
                            </div>
                        ) : availableChallenges.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    {challengeViewMode === "my" 
                                        ? "No tienes desafíos personales disponibles" 
                                        : "No hay desafíos de la comunidad disponibles"}
                                </p>
                                {challengeViewMode === "my" && (
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            setShowAssignModal(false);
                                            location.pathname = "/challenges";
                                        }}
                                    >
                                        Crear Desafío
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableChallenges.map(challenge => (
                                    <div 
                                        key={challenge._id}
                                        className="border rounded-lg p-4 hover:border-primary cursor-pointer transition"
                                        onClick={() => handleAssignChallenge(challenge._id)}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-3xl">{getCategoryIcon(challenge.category)}</span>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-foreground mb-1">{challenge.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {challenge.description}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Mostrar creador si es de la comunidad */}
                                        {challengeViewMode === "community" && typeof challenge.ownerUser === 'object' && challenge.ownerUser && (
                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                                                <div className="w-6 h-6 rounded-full p-0.5 bg-gradient-to-r from-primary to-accent flex-shrink-0">
                                                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                        <img
                                                            src={
                                                                challenge.ownerUser.profile?.avatarUrl || 
                                                                `https://api.dicebear.com/7.x/big-smile/svg?seed=${challenge.ownerUser.userName}`
                                                            }
                                                            alt={challenge.ownerUser.userName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        Por <span className="font-semibold">@{challenge.ownerUser.userName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                                {getDifficultyLabel(challenge.difficulty)}
                                            </span>
                                            <div className="flex items-center gap-1 text-primary font-bold">
                                                <Flame className="h-4 w-4" />
                                                <span>{challenge.points} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Level Up */}
            {showLevelUpModal && levelUpData && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    
                    {/* Modal */}
                    <div className="relative bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-500">
                        {/* Confeti animado con CSS */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full animate-confetti"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: '-10%',
                                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][Math.floor(Math.random() * 5)],
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${2 + Math.random() * 2}s`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Contenido */}
                        <div className="relative text-center text-white">
                            {/* Icono animado */}
                            <div className="mb-6 animate-bounce">
                                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Star className="w-16 h-16 text-yellow-300 fill-yellow-300 animate-pulse" />
                                </div>
                            </div>

                            {/* Texto */}
                            <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">¡LEVEL UP!</h2>
                            <p className="text-2xl font-semibold mb-4 drop-shadow-md">{levelUpData.message}</p>
                            <div className="text-6xl font-black mb-6 drop-shadow-2xl animate-pulse">
                                {levelUpData.newLevel}
                            </div>

                            {/* Botón */}
                            <Button
                                onClick={() => {
                                    setShowLevelUpModal(false);
                                    setLevelUpData(null);
                                }}
                                className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                            >
                                ¡Genial!
                            </Button>
                        </div>
                    </div>

                    {/* Estilos de animación de confeti */}
                    <style>{`
                        @keyframes confetti {
                            0% {
                                transform: translateY(0) rotate(0deg);
                                opacity: 1;
                            }
                            100% {
                                transform: translateY(100vh) rotate(720deg);
                                opacity: 0;
                            }
                        }
                        .animate-confetti {
                            animation: confetti linear infinite;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
