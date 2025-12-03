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
    SkipForward
} from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
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

export function Daily() {
    const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [challengeViewMode, setChallengeViewMode] = useState<"my" | "community">("my");
    
    const { user } = useSelector((state: RootState) => state.auth);

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
            
            // Si no hay misiones o está vacío, inicializar automáticamente
            if (!data || !data.missions || data.missions.length === 0) {
                const initResponse = await initializeDailyQuest();
                setDailyQuest(initResponse.dailyQuest);
                toast.success("Misiones del día generadas automáticamente");
            } else {
                setDailyQuest(data);
            }
        } catch (error: any) {
            // Si falla al obtener, intentar inicializar
            try {
                const initResponse = await initializeDailyQuest();
                setDailyQuest(initResponse.dailyQuest);
                toast.success("Misiones del día generadas");
            } catch (initError: any) {
                toast.error(initError.response?.data?.error || "Error al cargar misiones del día");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async () => {
        try {
            setLoading(true);
            const response = await initializeDailyQuest();
            setDailyQuest(response.dailyQuest);
            toast.success("¡Misiones diarias generadas!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al inicializar misiones");
        } finally {
            setLoading(false);
        }
    };

    const handleReroll = async (slot: number) => {
        try {
            setLoading(true);
            const response = await rerollGlobalMission(slot);
            setDailyQuest(response.dailyQuest);
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
            setDailyQuest(response.dailyQuest);
            toast.success(`¡Misión completada! +${response.pointsEarned} puntos 🎉`);
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
            setDailyQuest(response.dailyQuest);
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
                const initResponse = await initializeDailyQuest();
                setDailyQuest(initResponse.dailyQuest);
                toast.info("Inicializando misiones del día...");
            }
            
            const response = await assignPersonalChallenge({
                challengeId,
                slot: selectedSlot
            });
            setDailyQuest(response.dailyQuest);
            setShowAssignModal(false);
            setSelectedSlot(null);
            toast.success("¡Desafío asignado correctamente!");
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Error al asignar desafío";
            
            // Si el error es porque debe inicializar primero, hacerlo automáticamente
            if (errorMessage.includes("inicializar") || errorMessage.includes("DailyQuest")) {
                try {
                    const initResponse = await initializeDailyQuest();
                    setDailyQuest(initResponse.dailyQuest);
                    
                    // Reintentar asignación
                    const response = await assignPersonalChallenge({
                        challengeId,
                        slot: selectedSlot
                    });
                    setDailyQuest(response.dailyQuest);
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
            setDailyQuest(response.dailyQuest);
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
    const completedMissions = dailyQuest?.missions.filter(m => m.status === "completed").length || 0;
    const totalPoints = dailyQuest?.missions.reduce((sum, m) => sum + m.pointsAwarded, 0) || 0;
    const completionRate = dailyQuest?.missions.length 
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
            <Header currentView="daily" />
            
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
                    {dailyQuest && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    {/* Sin misiones - Inicializar */}
                    {!dailyQuest && (
                        <Card>
                            <CardContent className="pt-6 text-center py-12">
                                <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">¡Bienvenido a tu día!</h2>
                                <p className="text-muted-foreground mb-6">
                                    Genera tus 3 misiones globales diarias y comienza a ganar puntos
                                </p>
                                <Button size="lg" onClick={handleInitialize} disabled={loading}>
                                    <Zap className="h-5 w-5 mr-2" />
                                    Generar Misiones
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Misiones */}
                    {dailyQuest && (
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

                            {/* Misiones Personales (Slots 4-5) */}
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
                                        {[4, 5].map(slot => {
                                            const mission = dailyQuest.missions.find(m => m.slot === slot);
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
                                            window.location.href = "/challenges";
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
        </div>
    );
}
