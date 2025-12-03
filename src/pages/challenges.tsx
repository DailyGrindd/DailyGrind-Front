import { useState, useEffect } from "react";
import { Plus, Trophy, Flame, Target, Edit2, Trash2, X, Users, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Select } from "../components/select";
import { Header } from "../components/header";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
    getAllChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    reactivateChallenge
} from "../services/challengeServices";
import type { Challenge, CreateChallengeRequest, ChallengeCategory } from "../types/challenge";
import { CHALLENGE_CATEGORIES, getDifficultyLabel, getDifficultyPoints } from "../types/challenge";

export function Challenges() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterDifficulty, setFilterDifficulty] = useState<string>("");
    const [viewMode, setViewMode] = useState<"my" | "community">("my");
    const [showInactive, setShowInactive] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
    
    const { user } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState<CreateChallengeRequest>({
        type: "personal",
        title: "",
        description: "",
        category: "Ejercicio Físico",
        difficulty: 1,
        tags: [],
        isActive: true,
        maxPerDay: 1,
        minUserLevel: 0
    });

    useEffect(() => {
        loadChallenges();
    }, [filterCategory, filterDifficulty, viewMode, showInactive]);

    const loadChallenges = async () => {
        try {
            setLoading(true);
            const filters: any = { type: "personal" };
            
            // Filtrar por activo/inactivo según el toggle
            if (viewMode === "my") {
                filters.isActive = !showInactive;
            } else {
                // En comunidad siempre mostrar solo activos
                filters.isActive = true;
            }
            
            if (filterCategory) filters.category = filterCategory;
            if (filterDifficulty) filters.difficulty = Number(filterDifficulty);
            
            const data = await getAllChallenges(filters);
            
            const currentUserId = user?._id;
            
            // Filtrar según el modo de vista
            const filteredData = viewMode === "my" 
                ? data.filter(challenge => {
                    // Si ownerUser es un objeto, comparar por _id
                    if (typeof challenge.ownerUser === 'object' && challenge.ownerUser !== null) {
                        return challenge.ownerUser._id === currentUserId;
                    }
                    // Si ownerUser es solo un ID (string), comparar directamente
                    return challenge.ownerUser === currentUserId;
                })
                : data.filter(challenge => {
                    if (typeof challenge.ownerUser === 'object' && challenge.ownerUser !== null) {
                        return challenge.ownerUser._id !== currentUserId;
                    }
                    return challenge.ownerUser !== currentUserId;
                });
            
            setChallenges(filteredData);
        } catch (error: any) {
            toast.error(error.message || "Error al cargar desafíos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const challengeData = {
                ...formData,
                points: getDifficultyPoints(formData.difficulty)
            };

            if (editingChallenge) {
                await updateChallenge(editingChallenge._id, challengeData);
            } else {
                await createChallenge(challengeData);
                toast.success("Desafío creado exitosamente");
                // Cambiar a vista "Mis Desafíos" para que el usuario vea su nuevo desafío
                setViewMode("my");
            }
            
            resetForm();
            // Esperar un poco antes de recargar para asegurar que el backend procese
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadChallenges();
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Error al guardar desafío";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge);
        setFormData({
            type: "personal",
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            tags: challenge.tags || [],
            isActive: challenge.isActive,
            maxPerDay: challenge.rules.maxPerDay,
            minUserLevel: challenge.rules.minUserLevel
        });
        setShowCreateModal(true);
    };

    const handleDeleteClick = (id: string) => {
        setChallengeToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!challengeToDelete) return;
        
        try {
            setLoading(true);
            await deleteChallenge(challengeToDelete);
            toast.success("Desafío desactivado exitosamente");
            setShowDeleteConfirm(false);
            setChallengeToDelete(null);
            loadChallenges();
        } catch (error: any) {
            toast.error(error.message || "Error al desactivar desafío");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setChallengeToDelete(null);
    };

    const handleReactivate = async (id: string) => {
        try {
            setLoading(true);
            await reactivateChallenge(id);
            toast.success("Desafío reactivado exitosamente");
            loadChallenges();
        } catch (error: any) {
            toast.error(error.message || "Error al reactivar desafío");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            type: "personal",
            title: "",
            description: "",
            category: "Ejercicio Físico",
            difficulty: 1,
            tags: [],
            isActive: true,
            maxPerDay: 1,
            minUserLevel: 0
        });
        setEditingChallenge(null);
        setShowCreateModal(false);
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

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header currentView="challenges" />
            
            <div className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                            <Trophy className="h-10 w-10 text-primary" />
                            Desafíos
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {viewMode === "my" ? "Crea y gestiona tus desafíos personalizados" : "Explora desafíos de la comunidad"}
                        </p>
                    </div>
                    {viewMode === "my" && (
                        <Button onClick={() => setShowCreateModal(true)} size="lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Crear Desafío
                        </Button>
                    )}
                </div>

                {/* Selector de vista */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === "my" ? "default" : "outline"}
                                onClick={() => setViewMode("my")}
                                className="flex-1"
                            >
                                Mis Desafíos
                            </Button>
                            <Button
                                variant={viewMode === "community" ? "default" : "outline"}
                                onClick={() => setViewMode("community")}
                                className="flex-1"
                            >
                                Desafíos de la Comunidad
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtrar Desafíos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {CHALLENGE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Dificultad</Label>
                                <Select
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                >
                                    <option value="">Todas las dificultades</option>
                                    <option value="1">Fácil (10 pts)</option>
                                    <option value="2">Medio (20 pts)</option>
                                    <option value="3">Difícil (30 pts)</option>
                                </Select>
                            </div>
                        </div>
                        {viewMode === "my" && (
                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showInactive"
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300"
                                />
                                <Label htmlFor="showInactive" className="cursor-pointer">
                                    Mostrar desafíos inactivos
                                </Label>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Lista de desafíos */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Cargando desafíos...</p>
                    </div>
                ) : challenges.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-xl font-semibold text-foreground">
                                {viewMode === "my" ? "No tienes desafíos aún" : "No hay desafíos de la comunidad"}
                            </p>
                            <p className="text-muted-foreground mt-2">
                                {viewMode === "my" 
                                    ? "¡Crea tu primer desafío personal y comienza a mejorar tus hábitos!"
                                    : "Aún no hay desafíos compartidos por otros usuarios."
                                }
                            </p>
                            {viewMode === "my" && (
                                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear mi primer desafío
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.map((challenge) => (
                            <Card 
                                key={challenge._id} 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedChallenge(challenge)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                                            <div>
                                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                                <CardDescription className="text-xs">{challenge.category}</CardDescription>
                                            </div>
                                        </div>
                                        {((typeof challenge.ownerUser === 'object' && challenge.ownerUser?._id === user?._id) || 
                                          (typeof challenge.ownerUser === 'string' && challenge.ownerUser === user?._id)) && (
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                {challenge.isActive ? (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(challenge)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(challenge._id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReactivate(challenge._id)}
                                                        className="text-green-500"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                    
                                    {!challenge.isActive && (
                                        <div className="bg-gray-500/20 border border-gray-500 rounded px-2 py-1 text-xs text-gray-500 font-semibold w-fit">
                                            Inactivo
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between pt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                            {getDifficultyLabel(challenge.difficulty)}
                                        </span>
                                        <div className="flex items-center gap-1 text-primary font-bold">
                                            <Flame className="h-4 w-4" />
                                            <span>{challenge.points} pts</span>
                                        </div>
                                    </div>

                                    {challenge.tags && challenge.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-2">
                                            {challenge.tags.map((tag, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-accent/50 text-xs rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Modal Detalle del Desafío */}
                {selectedChallenge && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-black/50 z-[9998]"
                            onClick={() => setSelectedChallenge(null)}
                        />
                        
                        {/* Modal */}
                        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto z-[9999]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getCategoryIcon(selectedChallenge.category)}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{selectedChallenge.title}</h2>
                                        <p className="text-sm text-muted-foreground">{selectedChallenge.category}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedChallenge(null)}
                                    className="p-2 hover:bg-background rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Descripción */}
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Descripción</h3>
                                    <p className="text-foreground">{selectedChallenge.description}</p>
                                </div>

                                {/* Información del desafío */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Dificultad</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(selectedChallenge.difficulty)}`}>
                                            {getDifficultyLabel(selectedChallenge.difficulty)}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Puntos</p>
                                        <div className="flex items-center gap-1 text-primary font-bold text-lg">
                                            <Flame className="h-5 w-5" />
                                            <span>{selectedChallenge.points} pts</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas */}
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Estadísticas</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-accent/50 rounded-lg">
                                            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <p className="text-2xl font-bold text-foreground">{selectedChallenge.stats.timesAssigned}</p>
                                            <p className="text-xs text-muted-foreground">Asignados</p>
                                        </div>
                                        <div className="text-center p-3 bg-accent/50 rounded-lg">
                                            <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <p className="text-2xl font-bold text-foreground">{selectedChallenge.stats.timesCompleted}</p>
                                            <p className="text-xs text-muted-foreground">Completados</p>
                                        </div>
                                        <div className="text-center p-3 bg-accent/50 rounded-lg">
                                            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <p className="text-2xl font-bold text-foreground">{selectedChallenge.stats.completionRate.toFixed(0)}%</p>
                                            <p className="text-xs text-muted-foreground">Tasa de éxito</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Creador */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Creado por</h3>
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                                        {/* Avatar con borde gradiente */}
                                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-r from-primary to-accent shadow-md flex-shrink-0">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                <img
                                                    src={
                                                        typeof selectedChallenge.ownerUser === 'object' && selectedChallenge.ownerUser?.profile?.avatarUrl
                                                            ? selectedChallenge.ownerUser.profile.avatarUrl
                                                            : `https://api.dicebear.com/7.x/big-smile/svg?seed=${typeof selectedChallenge.ownerUser === 'object' ? selectedChallenge.ownerUser?.userName : 'Default'}`
                                                    }
                                                    alt={
                                                        typeof selectedChallenge.ownerUser === 'object'
                                                            ? (selectedChallenge.ownerUser?.profile?.displayName || selectedChallenge.ownerUser?.userName || "Usuario")
                                                            : "Usuario"
                                                    }
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">
                                                {typeof selectedChallenge.ownerUser === 'object'
                                                    ? (selectedChallenge.ownerUser?.profile?.displayName || selectedChallenge.ownerUser?.userName || "Usuario")
                                                    : "Usuario"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                @{typeof selectedChallenge.ownerUser === 'object' 
                                                    ? (selectedChallenge.ownerUser?.userName || "desconocido")
                                                    : "desconocido"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // TODO: Navegar al perfil del usuario
                                                toast.info("Funcionalidad de perfil próximamente");
                                            }}
                                        >
                                            Ver perfil
                                        </Button>
                                    </div>
                                </div>

                                {/* Reglas */}
                                {selectedChallenge.rules && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Reglas</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>Máximo {selectedChallenge.rules.maxPerDay} vez(ces) por día</span>
                                            </div>
                                            {selectedChallenge.rules.minUserLevel > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                    <span>Requiere nivel {selectedChallenge.rules.minUserLevel} o superior</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {selectedChallenge.tags && selectedChallenge.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Etiquetas</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedChallenge.tags.map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Botón de Asignar (solo para desafíos personales propios) */}
                                {selectedChallenge.type === "personal" && 
                                 typeof selectedChallenge.ownerUser === 'object' && 
                                 selectedChallenge.ownerUser?._id === user?._id && (
                                    <div className="pt-4 border-t">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={() => {
                                                setSelectedChallenge(null);
                                                window.location.href = "/daily";
                                            }}
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Asignar a Misiones Diarias
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Asigna este desafío a uno de tus slots personales (4 o 5)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Crear/Editar */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {editingChallenge ? "Editar Desafío" : "Crear Nuevo Desafío"}
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={resetForm}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <CardDescription>
                                    Los puntos se asignan automáticamente según la dificultad
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título del Desafío</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ej: Caminar 10,000 pasos"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción</Label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe tu desafío..."
                                            className="w-full min-h-[100px] p-3 border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoría</Label>
                                            <Select
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value as ChallengeCategory })}
                                                required
                                            >
                                                {CHALLENGE_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="difficulty">Dificultad</Label>
                                            <Select
                                                id="difficulty"
                                                value={formData.difficulty.toString()}
                                                onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) as 1 | 2 | 3 })}
                                                required
                                            >
                                                <option value="1">Fácil (10 pts)</option>
                                                <option value="2">Medio (20 pts)</option>
                                                <option value="3">Difícil (30 pts)</option>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={loading} className="flex-1">
                                            {loading ? "Guardando..." : editingChallenge ? "Actualizar" : "Crear Desafío"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Modal de confirmación para desactivar */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Trash2 className="h-5 w-5 text-red-500" />
                                    Desactivar Desafío
                                </CardTitle>
                                <CardDescription>
                                    ¿Estás seguro de que deseas desactivar este desafío?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    El desafío no será eliminado, solo se desactivará. Podrás reactivarlo más tarde si lo deseas.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteCancel}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 bg-red-500 hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        {loading ? "Desactivando..." : "Desactivar"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
