import { useState, useEffect } from "react";
import { Trophy, Medal, Crown, MapPin, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { Header } from "../components/header";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
    getGlobalRanking,
    getMyGlobalPosition,
    getZoneRanking,
    getMyZonePosition
} from "../services/rankingService";
import type {
    GlobalRankingResponse,
    MyGlobalPositionResponse,
    ZoneRankingResponse,
    MyZonePositionResponse
} from "../types/ranking";

type ViewMode = "global" | "zone";

// Lista de provincias argentinas
const PROVINCIAS = [
    "Buenos Aires",
    "Ciudad Autónoma de Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán"
];

export function Ranking(){
    const { user } = useSelector((state: RootState) => state.auth);

    const [viewMode, setViewMode] = useState<ViewMode>("global");
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedZone, setSelectedZone] = useState<string>(user?.zone || PROVINCIAS[0]);
    const [showMyPosition, setShowMyPosition] = useState<boolean>(false);

    //estado para ranking global
    const [globalRanking, setGlobalRanking] = useState<GlobalRankingResponse | null>(null);
    const [myGlobalPosition, setMyGlobalPosition] = useState<MyGlobalPositionResponse | null>(null);
    
    // estado para ranking por zona
    const [zoneRanking, setZoneRanking] = useState<ZoneRankingResponse | null>(null);
    const [myZonePosition, setMyZonePosition] = useState<MyZonePositionResponse | null>(null);

    useEffect(() => {
        if (viewMode === "global") {
            loadGlobalRanking();
        } else {
            loadZoneRanking();
        }
    }, [viewMode, selectedZone]);

    const loadGlobalRanking = async () => {
        setLoading(true);
        try {
            // Cargar solo el top 10
            const rankingData = await getGlobalRanking(1, 10);
            setGlobalRanking(rankingData);
        } catch (error: any) {
            toast.error(error.message || "Error al cargar el ranking global");
        } finally {
            setLoading(false);
        }
    };

    const loadZoneRanking = async () => {
        if (!selectedZone) {
            toast.error("Selecciona una zona");
            return;
        }

        setLoading(true);
        try {
            // Cargar solo el top 10 de la zona seleccionada
            const rankingData = await getZoneRanking(selectedZone, 1, 10);
            setZoneRanking(rankingData);
        } catch (error: any) {
            toast.error(error.message || "Error al cargar el ranking de zona");
        } finally {
            setLoading(false);
        }
    };

    const loadMyGlobalPosition = async () => {
        
        if (!user?.email) {
            toast.error("No se pudo obtener tu email");
            return;
        }

        setLoading(true);
        try {
            const positionData = await getMyGlobalPosition(user.email);
            setMyGlobalPosition(positionData);
            setShowMyPosition(true);
        } catch (error: any) {
            toast.error(error.message || "Error al cargar tu posición");
        } finally {
            setLoading(false);
        }
    };

    const loadMyZonePosition = async () => {
        
        if (!user?.zone) {
            toast.error("No tienes una zona asignada");
            return;
        }

        if (!user?.email) {
            toast.error("No se pudo obtener tu email");
            return;
        }
        console.log("Loading zone position for zone:", user.zone, "email:", user.email);
        setLoading(true);
        try {
            const positionData = await getMyZonePosition(user.zone, user.email);
            setMyZonePosition(positionData);
            setShowMyPosition(true);
        } catch (error: any) {
            toast.error(error.message || "Error al cargar tu posición en la zona");
        } finally {
            setLoading(false);
        }
    };
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
        return <span className="text-gray-500 font-semibold">#{rank}</span>;
    };

    const handleViewMyPosition = () => {
        if (viewMode === "global") {
            loadMyGlobalPosition();
        } else {
            if (user?.zone && selectedZone === user.zone){
                loadMyZonePosition();}
            else {
                toast.error(`Solo puedes ver tu posición en tu zona (${user?.zone}). Actualmente estás viendo: ${selectedZone}`);
            }
        }
    };

    const renderMyPositionSection = () => {
        if (!showMyPosition) return null;

        const position = viewMode === "global" ? myGlobalPosition?.myPosition : myZonePosition?.myPosition;
        const nearby = viewMode === "global" ? myGlobalPosition?.nearby : myZonePosition?.nearby;

        if (!position) return null;

        return (
            <div className="mb-6 space-y-4">
                {/* Mi posición */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-6 h-6" />
                                Tu Posición {viewMode === "global" ? "Global" : `en ${user?.zone}`}
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMyPosition(false)}
                                className="text-purple-600 hover:text-purple-700"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold text-white">
                                    #{position.rank}
                                </div>
                                <img
                                    src={position.avatarUrl || "/default-avatar.png"}
                                    alt={position.displayName}
                                    className="w-16 h-16 rounded-full border-4 border-white"
                                />
                                <div>
                                    <p className="text-2xl font-bold">{position.displayName}</p>
                                    {viewMode === "global" && position.zone && (
                                        <p className="text-sm opacity-90 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {position.zone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-bold">{position.totalPoints.toLocaleString()}</p>
                                <p className="text-sm opacity-90">puntos</p>
                                <p className="text-lg mt-2">Nivel {position.level}</p>
                                <p className="text-sm opacity-90">{position.totalCompleted} completados</p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm opacity-90">
                            {viewMode === "global" 
                                ? `Estás en el puesto ${position.rank} de ${myGlobalPosition?.totalUsers.toLocaleString()} usuarios`
                                : `Estás en el puesto ${position.rank} de ${myZonePosition?.totalUsersInZone.toLocaleString()} usuarios en ${myZonePosition?.zone}`
                            }
                        </div>
                    </CardContent>
                </Card>

                {/* Usuarios cercanos */}
                {nearby && nearby.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Usuarios Cercanos a Tu Posición</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {nearby.map((nearbyUser, index) => (
                                    <div
                                        key={`${nearbyUser.rank}-${index}`}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                            nearbyUser.isCurrentUser 
                                                ? "bg-blue-100 border-2 border-blue-500" 
                                                : "bg-gray-50 hover:bg-gray-100"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 flex justify-center text-sm font-semibold text-gray-600">
                                                #{nearbyUser.rank}
                                            </div>
                                            <img
                                                src={nearbyUser.avatarUrl || "/default-avatar.png"}
                                                alt={nearbyUser.displayName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="font-semibold">
                                                    {nearbyUser.displayName}
                                                    {nearbyUser.isCurrentUser && (
                                                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                                            Tú
                                                        </span>
                                                    )}
                                                </p>
                                                {viewMode === "global" && nearbyUser.zone && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {nearbyUser.zone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{nearbyUser.totalPoints.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Nivel {nearbyUser.level}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderRankingList = () => {
        const rankings = viewMode === "global" ? globalRanking?.rankings : zoneRanking?.rankings;

        if (!rankings || rankings.length === 0) {
            return (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No hay usuarios en el ranking
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                {viewMode === "global" ? (
                                    <>
                                        <Globe className="w-6 h-6" />
                                        Top 10 Global
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="w-6 h-6" />
                                        Top 10 de {selectedZone}
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Los mejores usuarios {viewMode === "global" ? "del mundo" : `de ${selectedZone}`}
                            </CardDescription>
                        </div>
                        {(viewMode === "global" || (viewMode === "zone" && selectedZone === user?.zone)) && (
                            <Button
                                onClick={handleViewMyPosition}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Trophy className="w-4 h-4" />
                                Ver Mi Posición
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {rankings.map((rankUser) => (
                            <div
                                key={`${rankUser.rank}-${rankUser.displayName}`}
                                className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${
                                    rankUser.rank <= 3 
                                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300" 
                                        : "bg-gray-50 hover:bg-gray-100"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 flex justify-center">
                                        {getRankIcon(rankUser.rank)}
                                    </div>
                                    <img
                                        src={rankUser.avatarUrl || "/default-avatar.png"}
                                        alt={rankUser.displayName}
                                        className="w-14 h-14 rounded-full border-2 border-gray-200"
                                    />
                                    <div>
                                        <p className="font-bold text-lg">{rankUser.displayName}</p>
                                        {viewMode === "global" && rankUser.zone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {rankUser.zone}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {rankUser.totalCompleted} retos completados
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-2xl text-purple-600">
                                        {rankUser.totalPoints.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">puntos</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-1">
                                        Nivel {rankUser.level}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            <Header currentView="ranking" />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-purple-600" />
                        Ranking de Usuarios
                    </h1>
                    <p className="text-gray-600">
                        Compite con otros usuarios y alcanza la cima del ranking
                    </p>
                </div>

                {/* Selector de vista */}
                <div className="flex gap-4 mb-6 items-center flex-wrap">
                    <Button
                        onClick={() => {
                            setViewMode("global");
                            setShowMyPosition(false);
                        }}
                        variant={viewMode === "global" ? "default" : "outline"}
                        className="flex items-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Ranking Global
                    </Button>
                    <Button
                        onClick={() => {
                            setViewMode("zone");
                            setShowMyPosition(false);
                        }}
                        variant={viewMode === "zone" ? "default" : "outline"}
                        className="flex items-center gap-2"
                    >
                        <MapPin className="w-4 h-4" />
                        Ranking por Zona
                    </Button>

                    {/* Selector de zona (solo visible cuando viewMode es "zone") */}
                    {viewMode === "zone" && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Seleccionar Zona:</label>
                            <select
                                value={selectedZone}
                                onChange={(e) => {
                                    setSelectedZone(e.target.value);
                                    setShowMyPosition(false);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {PROVINCIAS.map((provincia) => (
                                    <option key={provincia} value={provincia}>
                                        {provincia}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {loading ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando ranking...</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {renderMyPositionSection()}
                        {renderRankingList()}
                    </>
                )}
            </main>
        </div>
    );
}