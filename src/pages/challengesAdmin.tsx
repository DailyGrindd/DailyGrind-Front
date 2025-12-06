import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Plus, Flame, Edit2, Trash2, X, RefreshCw, Search, Target, LibraryBig, Loader2, Zap, SlidersHorizontal, Calendar, Trophy, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Select } from "../components/select";
import { Header } from "../components/header";
import { toast } from "sonner";
import { getAllChallenges, createChallengeAdmin, updateChallengeAdmin, deleteChallenge, reactivateChallenge, getChallengeById } from "../services/challengeServices";
import type { Challenge, CreateChallengeAdminRequest, UpdateChallengeAdminRequest, ChallengeCategory } from "../types/challenge";
import { CHALLENGE_CATEGORIES, getDifficultyLabel, getDifficultyPoints } from "../types/challenge";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const CATEGORY_EMOJIS: Record<ChallengeCategory, string> = {
    "Ejercicio Físico": "💪",
    "Alimentación Saludable": "🥗",
    "Hidratación": "💧",
    "Descanso": "😴",
    "Salud Mental": "🧠",
    "Hábitos Diarios": "📅"
};

export function ChallengesAdmin() {
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState<string>("");
    const [showInactive, setShowInactive] = useState(false);

    // Query para obtener todos los desafíos globales
    const { data: allChallenges, refetch } = useQuery({
        queryKey: ["adminChallenges"],
        queryFn: async () => {
            const data = await getAllChallenges({ type: "global" });
            return data;
        }
    });

    const [formData, setFormData] = useState<CreateChallengeAdminRequest>({
        type: "global",
        ownerUser: user?._id || "",
        title: "",
        description: "",
        category: "Ejercicio Físico",
        difficulty: 1,
        points: 10,
        tags: [],
        isActive: true,
        minLevel: 0,
        preRequisiteChallenge: undefined,
        maxPerDay: 1,
        minUserLevel: 0
    });

    useEffect(() => {
        if (allChallenges) {
            setChallenges(allChallenges);
        }
    }, [allChallenges]);

    useEffect(() => {
        let filtered = challenges;

        // Filtrar por categoría seleccionada
        if (selectedCategory) {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        // Filtrar por estado activo/inactivo
        filtered = filtered.filter(c => showInactive ? !c.isActive : c.isActive);

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por dificultad
        if (difficultyFilter) {
            filtered = filtered.filter(c => c.difficulty === Number(difficultyFilter));
        }

        setFilteredChallenges(filtered);
    }, [challenges, selectedCategory, searchTerm, difficultyFilter, showInactive]);

    const handleCategoryClick = (category: ChallengeCategory) => {
        setSelectedCategory(selectedCategory === category ? null : category);
    };

    const handleDeleteClick = (id: string) => {
        setChallengeToDelete(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!challengeToDelete) return;

        try {
            setLoading(true);
            
            if (selectedChallenge?.isActive) {
                await deleteChallenge(challengeToDelete);
                toast.success("Desafío desactivado exitosamente");
            } else {
                await reactivateChallenge(challengeToDelete);
                toast.success("Desafío reactivado exitosamente");
            }
            
            setShowDeleteConfirm(false);
            setChallengeToDelete(null);
            
            // Cerrar el dialog de detalles después de desactivar/reactivar
            setShowDetailDialog(false);
            setSelectedChallenge(null);
            
            await refetch();
        } catch (error: any) {
            toast.error(error.message || "Error al cambiar estado del desafío");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (challenge: Challenge) => {
        console.log("Challenge a editar:", challenge);
        console.log("PreRequisite:", challenge.requirements.preRequisiteChallenge);
        
        setEditingChallenge(challenge);
        
        // Extraer el ID del prerequisito si es un objeto
        let prerequisiteId: string | undefined = undefined;
        if (challenge.requirements.preRequisiteChallenge) {
            if (typeof challenge.requirements.preRequisiteChallenge === 'string') {
                prerequisiteId = challenge.requirements.preRequisiteChallenge;
            } else if (typeof challenge.requirements.preRequisiteChallenge === 'object' && '_id' in challenge.requirements.preRequisiteChallenge) {
                prerequisiteId = (challenge.requirements.preRequisiteChallenge as any)._id;
            }
        }
        
        setFormData({
            type: "global",
            ownerUser: typeof challenge.ownerUser === 'object' ? challenge.ownerUser._id : challenge.ownerUser || "",
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            difficulty: challenge.difficulty,
            points: challenge.points,
            tags: challenge.tags || [],
            isActive: challenge.isActive,
            minLevel: challenge.requirements.minLevel,
            preRequisiteChallenge: prerequisiteId,
            maxPerDay: challenge.rules.maxPerDay,
            minUserLevel: challenge.rules.minUserLevel
        });
        
        console.log("FormData seteado con prerequisiteId:", prerequisiteId);
        setShowCreateDialog(true);
    };

    const resetForm = () => {
        setFormData({
            type: "global",
            ownerUser: user?._id || "",
            title: "",
            description: "",
            category: "Ejercicio Físico",
            difficulty: 1,
            points: 10,
            tags: [],
            isActive: true,
            minLevel: 0,
            preRequisiteChallenge: undefined,
            maxPerDay: 1,
            minUserLevel: 0
        });
        setEditingChallenge(null);
        setShowCreateDialog(false);
        
        // Si estamos editando desde el detalle, refrescar los datos
        if (showDetailDialog && selectedChallenge) {
            detalleQuery.refetch();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Preparar los datos del desafío
            const challengeData = {
                type: "global" as const,
                ownerUser: user?._id || "",
                title: formData.title,
                description: formData.description,
                category: formData.category,
                difficulty: formData.difficulty,
                points: getDifficultyPoints(formData.difficulty),
                isActive: true,
                tags: formData.tags?.filter(tag => tag.trim().length > 0) || [],
                minLevel: formData.minLevel,
                preRequisiteChallenge: formData.preRequisiteChallenge && formData.preRequisiteChallenge.trim() !== "" 
                    ? formData.preRequisiteChallenge 
                    : null,
                maxPerDay: formData.maxPerDay,
                minUserLevel: formData.minLevel 
            };

            if (editingChallenge) {
                const updateData: UpdateChallengeAdminRequest = {
                    title: challengeData.title,
                    description: challengeData.description,
                    category: challengeData.category,
                    difficulty: challengeData.difficulty,
                    points: challengeData.points,
                    tags: challengeData.tags,
                    minLevel: challengeData.minLevel,
                    preRequisiteChallenge: challengeData.preRequisiteChallenge as string | null | undefined,
                    maxPerDay: challengeData.maxPerDay,
                    minUserLevel: challengeData.minUserLevel
                };
                console.log("Datos a enviar para actualizar:", updateData);
                await updateChallengeAdmin(editingChallenge._id, updateData);
                toast.success("Desafío actualizado exitosamente");
                
                if (showDetailDialog) {
                    await detalleQuery.refetch();
                    // Actualizar el selectedChallenge con los nuevos datos
                    const updatedChallenge = await getChallengeById(editingChallenge._id);
                    setSelectedChallenge(updatedChallenge);
                }
            } else {
                await createChallengeAdmin(challengeData);
                toast.success("Desafío global creado exitosamente");
            }

            // Cerrar solo el dialog de editar, no el de detalles
            setFormData({
                type: "global",
                ownerUser: user?._id || "",
                title: "",
                description: "",
                category: "Ejercicio Físico",
                difficulty: 1,
                points: 10,
                tags: [],
                isActive: true,
                minLevel: 0,
                preRequisiteChallenge: undefined,
                maxPerDay: 1,
                minUserLevel: 0
            });
            setEditingChallenge(null);
            setShowCreateDialog(false);
            
            refetch();
        } catch (error: any) {
            console.error("Error completo:", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Error al guardar desafío";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Agregar query para el detalle del desafío
    const detalleQuery = useQuery<Challenge>({
        queryKey: ["detalleChallengeAdmin", selectedChallenge?._id],
        queryFn: async () => {
            if (!selectedChallenge?._id) throw new Error("ID inválido");
            return await getChallengeById(selectedChallenge._id);
        },
        enabled: showDetailDialog && selectedChallenge != null,
        staleTime: 0,
        gcTime: 1000 * 30,
    });

    const handleViewDetails = async (challenge: Challenge) => {
        try {
            setLoading(true);
            const fullChallenge = await getChallengeById(challenge._id);
            setSelectedChallenge(fullChallenge);
            setShowDetailDialog(true);
        } catch (error: any) {
            toast.error("Error al cargar detalles del desafío");
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (id: string) => {
        try {
            setLoading(true);
            await reactivateChallenge(id);
            toast.success("Desafío reactivado exitosamente");
            setShowDetailDialog(false);
            setSelectedChallenge(null);
            
            await refetch();
        } catch (error: any) {
            toast.error(error.message || "Error al reactivar desafío");
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header currentView={location.pathname.includes("challengesAdmin") ? "challengesAdmin" : ""} />

            <main className="flex-1 container mx-auto px-6 md:px-10 py-6 md:py-10 space-y-6 md:space-y-8">
                <header className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:text-start text-center md:justify-between gap-3">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold">Desafíos Globales</h1>
                            <p className="text-muted-foreground">Gestiona los desafíos disponibles para todos los usuarios</p>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)} className="md:ml-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Desafío
                        </Button>
                    </div>
                </header>

                {/* Categorías */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 md:text-lg">
                            <LibraryBig className="h-5 w-5 text-primary" />
                            Categorías
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">Selecciona una categoría para filtrar los desafíos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {CHALLENGE_CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedCategory === category
                                        ? "border-active border-3 bg-green-100 shadow-lg"
                                        : "border-border hover:border-primary"
                                        }`}
                                >
                                    <div className="text-center space-y-2">
                                        <div className="text-3xl">{CATEGORY_EMOJIS[category]}</div>
                                        <p className="text-xs font-medium text-foreground">{category}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {challenges.filter(c => c.category === category && c.isActive).length} activos
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filtros*/}
                {selectedCategory && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                Filtros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Buscar</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Buscar por título..."
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Dificultad</Label>
                                    <Select
                                        id="difficulty"
                                        value={difficultyFilter}
                                        onChange={(e) => setDifficultyFilter(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        <option value="1">Fácil (10 pts)</option>
                                        <option value="2">Medio (20 pts)</option>
                                        <option value="3">Difícil (30 pts)</option>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="showInactive"
                                            checked={showInactive}
                                            onChange={(e) => setShowInactive(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                        <Label htmlFor="showInactive" className="cursor-pointer">
                                            Mostrar inactivos
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex items-end md:col-span-1 md:justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedCategory(null)}
                                        className="w-full md:w-auto py-1 border-2 border-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:border-active"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Limpiar filtro
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lista de desafíos */}
                {selectedCategory && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <span className="text-3xl">{CATEGORY_EMOJIS[selectedCategory]}</span>
                                {selectedCategory}
                            </h2>
                        </div>

                        {filteredChallenges.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-xl font-semibold text-foreground">
                                        No hay desafíos en esta categoría
                                    </p>
                                    <p className="text-muted-foreground mt-2">
                                        Crea un nuevo desafío global para esta categoría
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredChallenges.map((challenge) => (
                                    <Card
                                        key={challenge._id}
                                        className="hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => handleViewDetails(challenge)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                                {!challenge.isActive && (
                                                    <span className="px-2 py-1 bg-gray-500/20 text-gray-500 text-xs rounded font-semibold">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {challenge.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                                                    {getDifficultyLabel(challenge.difficulty)}
                                                </span>
                                                <div className="flex items-center gap-1 text-primary font-bold">
                                                    <Flame className="h-4 w-4" />
                                                    <span>{challenge.points} pts</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                                <span>Asignados: {challenge.stats.timesAssigned}</span>
                                                <span>Completados: {challenge.stats.timesCompleted}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Si no hay categoría seleccionada */}
                {!selectedCategory && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <LibraryBig className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-xl font-semibold text-foreground">
                                Selecciona una categoría para ver los desafíos
                            </p>
                            <p className="text-muted-foreground mt-2">
                                Total de desafíos globales: {challenges.filter(c => c.isActive).length} activos
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Dialog de Detalles */}
                {showDetailDialog && selectedChallenge && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                        <div
                            className="fixed inset-0 bg-black/50 z-[9998]"
                            onClick={() => setShowDetailDialog(false)}
                        />

                        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto z-[9999]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{CATEGORY_EMOJIS[selectedChallenge.category]}</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{selectedChallenge.title}</h2>
                                        <p className="text-sm text-muted-foreground">{selectedChallenge.category}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailDialog(false)}
                                    className="p-2 hover:bg-active hover:text-white text-muted-foreground rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Estado */}
                                {!selectedChallenge.isActive && (
                                    <div className="bg-gray-500/10 border border-gray-500 rounded-lg p-3 text-center">
                                        <p className="text-sm font-semibold text-gray-500">Este desafío está inactivo</p>
                                    </div>
                                )}

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
                                            <Users className="h-5 w-5 mx-auto mb-1 text-active" />
                                            <p className="text-2xl font-medium text-foreground">{selectedChallenge.stats.timesAssigned}</p>
                                            <p className="text-xs text-muted-foreground">Asignados</p>
                                        </div>
                                        <div className="text-center p-3 bg-accent/50 rounded-lg">
                                            <Trophy className="h-5 w-5 mx-auto mb-1 text-active" />
                                            <p className="text-2xl font-medium text-foreground">{selectedChallenge.stats.timesCompleted}</p>
                                            <p className="text-xs text-muted-foreground">Completados</p>
                                        </div>
                                        <div className="text-center p-3 bg-accent/50 rounded-lg">
                                            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-active" />
                                            <p className="text-2xl font-medium text-foreground">{selectedChallenge.stats.completionRate.toFixed(0)}%</p>
                                            <p className="text-xs text-muted-foreground">Tasa de éxito</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Requisitos */}
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Requisitos</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-muted-foreground" />
                                            <span>Nivel mínimo: {selectedChallenge.requirements.minLevel}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Máximo {selectedChallenge.rules.maxPerDay} vez(ces) por día</span>
                                        </div>
                                        {selectedChallenge.requirements.preRequisiteChallenge && (
                                            <div className="flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    Requiere completar: {' '}
                                                    {typeof selectedChallenge.requirements.preRequisiteChallenge === 'object' 
                                                        ? (selectedChallenge.requirements.preRequisiteChallenge as any).title
                                                        : 'Desafío prerequisito'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedChallenge.tags && selectedChallenge.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Etiquetas</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedChallenge.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-sm rounded-full font-medium">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex gap-2 pt-4 border-t">
                                    {selectedChallenge.isActive ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-primary hover:bg-primary"
                                                onClick={() => handleEdit(selectedChallenge)}
                                            >
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-500 hover:bg-red-500"
                                                onClick={() => handleDeleteClick(selectedChallenge._id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Desactivar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            className="flex-1"
                                            onClick={() => handleReactivate(selectedChallenge._id)}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Reactivar Desafío
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog Crear/Editar */}
                {showCreateDialog && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                        <div 
                            className="fixed inset-0 bg-black/50 z-[99998]"
                            onClick={resetForm}
                        />
                        
                        <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto z-[99999]">
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center gap-3">
                                    <Plus className="h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-bold">
                                        {editingChallenge ? "Editar Desafío Global" : "Crear Desafío Global"}
                                    </h2>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-background rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-4 px-6 pb-6 pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Título del Desafío */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título del Desafío *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ej: Caminar 10,000 pasos"
                                            required
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descripción *</Label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe el desafío..."
                                            className="w-full min-h-[100px] p-3 text-sm border border-border rounded-md bg-input text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>

                                    {/* Grid para Categoría y Dificultad */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Categoría */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoría *</Label>
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

                                        {/* Dificultad */}
                                        <div className="space-y-2">
                                            <Label htmlFor="difficulty">Dificultad *</Label>
                                            <Select
                                                id="difficulty"
                                                value={formData.difficulty.toString()}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    difficulty: Number(e.target.value) as 1 | 2 | 3,
                                                    points: getDifficultyPoints(Number(e.target.value) as 1 | 2 | 3)
                                                })}
                                                required
                                            >
                                                <option value="1">Fácil (10 pts)</option>
                                                <option value="2">Medio (20 pts)</option>
                                                <option value="3">Difícil (30 pts)</option>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Grid para Nivel Mínimo y Máx. por Día */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minLevel">Nivel Mínimo</Label>
                                            <Input
                                                id="minLevel"
                                                type="number"
                                                min="0"
                                                value={formData.minLevel}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    setFormData({ 
                                                        ...formData, 
                                                        minLevel: value,
                                                        minUserLevel: value 
                                                    });
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground">Nivel requerido para acceder al desafío</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxPerDay">Máximo por Día</Label>
                                            <Input
                                                id="maxPerDay"
                                                type="number"
                                                min="1"
                                                value={formData.maxPerDay}
                                                onChange={(e) => setFormData({ ...formData, maxPerDay: Number(e.target.value) })}
                                            />
                                            <p className="text-xs text-muted-foreground">Veces que se puede completar por día</p>
                                        </div>
                                    </div>

                                    {/* Desafío Prerequisito */}
                                    <div className="space-y-2">
                                        <Label htmlFor="prerequisite">Desafío Prerequerido (Opcional)</Label>
                                        <Select
                                            id="prerequisite"
                                            value={formData.preRequisiteChallenge || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preRequisiteChallenge: e.target.value || undefined
                                            })}
                                        >
                                            <option value="">Sin prerequisito</option>
                                            {challenges
                                                .filter(c => c.isActive && c._id !== editingChallenge?._id)
                                                .map(c => (
                                                    <option key={c._id} value={c._id}>
                                                        {c.title} ({c.category})
                                                    </option>
                                                ))}
                                        </Select>
                                        <p className="text-xs text-muted-foreground">Desafío que debe completarse antes de acceder a este</p>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Etiquetas (Opcional)</Label>
                                        <Input
                                            id="tags"
                                            value={formData.tags?.join(", ") || ""}
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                // Si está vacío, limpiar el array
                                                if (inputValue.trim() === "") {
                                                    setFormData({ ...formData, tags: [] });
                                                    return;
                                                }
                                                // Dividir por comas
                                                const tagsArray = inputValue
                                                    .split(",")
                                                    .map(tag => tag.trim());
                                                setFormData({ ...formData, tags: tagsArray });
                                            }}
                                            placeholder="deporte, cardio, resistencia (separadas por comas)"
                                        />
                                        <p className="text-xs text-muted-foreground">Escribe las etiquetas separadas por comas</p>
                                        {formData.tags && formData.tags.filter(tag => tag.length > 0).length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.tags.filter(tag => tag.length > 0).map((tag, idx) => (
                                                    <span 
                                                        key={idx} 
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const inputValue = formData.tags?.join(", ") || "";
                                                                const tagsArray = inputValue.split(",").map(t => t.trim());
                                                                const newTags = tagsArray.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, tags: newTags });
                                                            }}
                                                            className="hover:text-primary/70"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nota sobre puntos */}
                                    <div className="bg-primary/5 border border-gray-400 rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">Nota:</span> Los puntos se asignan automáticamente según la dificultad seleccionada
                                        </p>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 px-2 py-1 text-sm border-2 border-border text-muted-foreground rounded-lg font-medium hover:text-black hover:border-black transition-colors"
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-2 py-1 text-sm bg-transparent border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Guardando...
                                                </div>
                                            ) : (
                                                editingChallenge ? "Actualizar Desafío" : "Crear Desafío"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog de confirmación para desactivar */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                        <div 
                            className="fixed inset-0 bg-black/50 z-[99998]"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setChallengeToDelete(null);
                            }}
                        />
                        
                        <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl z-[99999]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {selectedChallenge?.isActive ? (
                                        <>
                                            <Trash2 className="h-5 w-5 text-destructive" />
                                            <h2 className="text-xl font-bold">Desactivar Desafío</h2>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-5 w-5 text-active" />
                                            <h2 className="text-xl font-bold">Reactivar Desafío</h2>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setChallengeToDelete(null);
                                    }}
                                    className="p-2 hover:bg-background rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {selectedChallenge?.isActive
                                        ? '¿Estás seguro de que deseas desactivar este desafío? El desafío no estará disponible para los usuarios hasta que sea reactivado.'
                                        : '¿Estás seguro de que deseas reactivar este desafío? El desafío volverá a estar disponible para los usuarios.'
                                    }
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setChallengeToDelete(null);
                                        }}
                                        className="flex-1 px-2 py-1 border-2 border-border text-muted-foreground text-sm rounded-lg font-medium hover:text-black hover:border-black transition-colors"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className={`flex-1 px-2 py-1 text-sm rounded-lg font-medium transition-colors ${
                                            selectedChallenge?.isActive
                                                ? 'bg-transparent hover:bg-destructive hover:text-white border-destructive border-2 text-destructive'
                                                : 'bg-transparent hover:bg-active hover:text-white border-active border-2 text-active'
                                        }`}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Procesando...
                                            </div>
                                        ) : (
                                            selectedChallenge?.isActive ? 'Aceptar desactivación' : 'Aceptar reactivación'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}