import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Header } from "../components/header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../components/dialog";
import { Search, Calendar, Loader2, SlidersHorizontal, User, CircleUserRound, MapPin, Activity, TrendingUp, Zap, GamepadDirectional, ChartColumn, UserX, PencilLine, UsersRound, ArrowUp01, UserCheck } from "lucide-react";
import { Select } from "../components/select";
import type { GetUserResponse, UploadUserRequest } from "../types/user";
import { obtenerUsuarios, obtenerUsuario, darDeAltaUsuario, darDeBajaUsuario, uploadUser } from "../services/userServices";

export function Users() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRol, setFilterRol] = useState<string | "todos">("todos");
    const [selectedUsuarioEmail, setSelectedUsuarioEmail] = useState<string | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [showStatusChangeConfirm, setShowStatusChangeConfirm] = useState(false);
    const [statusChangeAction, setStatusChangeAction] = useState<'activate' | 'deactivate' | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<UploadUserRequest>>({});

    const {
        data: usuarios = [],
        isLoading: isLoadingUsuarios,
        isError: isErrorUsuarios,
        refetch: refetchUsuarios,
    } = useQuery({
        queryKey: ["usuarios", filterRol],
        queryFn: async () => {

            // Si no hay filtro - usar endpoint general
            if (!filterRol || filterRol === "todos") {
                const data = await obtenerUsuarios();
                return data;
            }

            // Si hay filtros - usar endpoint filtrado
            const data = await obtenerUsuarios(filterRol);
            return data;
        }
    });

    // Usuarios todos o filtrados por rol y aplico filtrado por el panel de busqueda
    const usuariosFiltrados = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        let resultado = usuarios;

        // Aplicar filtro de búsqueda si hay término
        if (term) {
            resultado = usuarios.filter((u) => {
                const email = u.email?.toLowerCase() || "";
                const userName = u.userName?.toLowerCase() || "";

                // Fecha normalizada 
                const fecha = u.lastActive
                    ? new Date(u.lastActive).toLocaleDateString("es-AR") // dd/mm/yyyy
                    : "";
                // por si el usuario escribe 2025/01
                const fechaISO = u.lastActive
                    ? new Date(u.lastActive).toISOString().toLowerCase()
                    : "";

                return (
                    email.includes(term) ||
                    userName.includes(term) ||
                    fecha.toLowerCase().includes(term) ||
                    fechaISO.includes(term)
                );
            });
        }

        // Ordenar por fecha de más reciente a más antigua
        return resultado.sort((a, b) => {
            const dateA = new Date(a.lastActive).getTime();
            const dateB = new Date(b.lastActive).getTime();
            return dateB - dateA; // Orden descendente (más reciente primero)
        });
    }, [usuarios, searchTerm]);

    // Calculos de resumenes en cards
    const totalUsuariosActivosHoy = useMemo(
        () => usuariosFiltrados.filter((u) => {
            const hoy = new Date();
            const lastActive = new Date(u.lastActive);
            return lastActive.toDateString() === hoy.toDateString();
        }).length,
        [usuariosFiltrados]
    );

    // Estadísticas por niveles
    const usuariosPorNivel = useMemo(() => {
        const niveles = {
            nivel1_20: 0,
            nivel21_40: 0,
            nivel41_60: 0,
            nivel61_mas: 0
        };

        usuariosFiltrados.forEach((u) => {
            const nivel = u.level || 0;
            if (nivel >= 1 && nivel <= 20) niveles.nivel1_20++;
            else if (nivel >= 21 && nivel <= 40) niveles.nivel21_40++;
            else if (nivel >= 41 && nivel <= 60) niveles.nivel41_60++;
            else if (nivel >= 61) niveles.nivel61_mas++;
        });

        return niveles;
    }, [usuariosFiltrados]);

    const maxUsuariosPorNivel = Math.max(
        usuariosPorNivel.nivel1_20,
        usuariosPorNivel.nivel21_40,
        usuariosPorNivel.nivel41_60,
        usuariosPorNivel.nivel61_mas,
        1
    );

    // abrir detalle (setea email y abre dialog)
    const openDetailDialog = (email: string) => {
        setSelectedUsuarioEmail(email);
        setIsDetailDialogOpen(true);
    };

    // detalle de usuario (se realiza cuando se abre el dialog con un email)
    const detalleQuery = useQuery<GetUserResponse>({
        queryKey: ["detalleUsuario", selectedUsuarioEmail],
        queryFn: async () => {
            if (!selectedUsuarioEmail) throw new Error("Email inválido");
            return await obtenerUsuario(selectedUsuarioEmail);
        },
        enabled: isDetailDialogOpen && selectedUsuarioEmail != null,
        staleTime: 0,
        gcTime: 1000 * 30,
    });

    // Manejar click en botón de dar de baja/alta
    const handleStatusChange = (action: 'activate' | 'deactivate') => {
        setStatusChangeAction(action);
        setShowStatusChangeConfirm(true);
    };

    // Confirmar cambio de estado
    const handleStatusChangeConfirm = async () => {
        if (!selectedUsuarioEmail || !statusChangeAction) return;

        setLoading(true);
        try {
            if (statusChangeAction === 'deactivate') {
                await darDeBajaUsuario(selectedUsuarioEmail);
                toast.success("Usuario dado de baja exitosamente");
            } else {
                await darDeAltaUsuario(selectedUsuarioEmail);
                toast.success("Usuario dado de alta exitosamente");
            }

            // Refrescar datos
            await detalleQuery.refetch();
            await refetchUsuarios();

            // Cerrar modales
            setShowStatusChangeConfirm(false);
            setStatusChangeAction(null);
        } catch (error: any) {
            toast.error(error.message || "Error al cambiar el estado del usuario");
        } finally {
            setLoading(false);
        }
    };

    // Cancelar cambio de estado
    const handleStatusChangeCancel = () => {
        setShowStatusChangeConfirm(false);
        setStatusChangeAction(null);
    };

    // Abrir dialog de edición
    const handleOpenEditDialog = () => {
        if (!detalleQuery.data) return;
        
        // Precargar datos del usuario
        setEditFormData({
            userName: detalleQuery.data.userName,
            email: detalleQuery.data.email,
            displayName: detalleQuery.data.profile.displayName,
            zone: detalleQuery.data.profile.zone,
            isPublic: detalleQuery.data.profile.isPublic,
            role: detalleQuery.data.role,
            level: detalleQuery.data.level,
        });
        setIsEditDialogOpen(true);
    };

    // Manejar cambios en el formulario
    const handleEditFormChange = (field: keyof UploadUserRequest, value: any) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Guardar cambios del usuario
    const handleSaveUserChanges = async () => {
        if (!selectedUsuarioEmail) return;

        // Crear objeto solo con campos modificados
        const originalData = detalleQuery.data;
        const changedFields: Partial<UploadUserRequest> = {};

        if (editFormData.userName && editFormData.userName !== originalData?.userName) {
            changedFields.userName = editFormData.userName;
        }
        if (editFormData.email && editFormData.email !== originalData?.email) {
            changedFields.email = editFormData.email;
        }
        if (editFormData.displayName && editFormData.displayName !== originalData?.profile.displayName) {
            changedFields.displayName = editFormData.displayName;
        }
        if (editFormData.zone && editFormData.zone !== originalData?.profile.zone) {
            changedFields.zone = editFormData.zone;
        }
        if (editFormData.isPublic !== undefined && editFormData.isPublic !== originalData?.profile.isPublic) {
            changedFields.isPublic = editFormData.isPublic;
        }
        if (editFormData.role && editFormData.role !== originalData?.role) {
            changedFields.role = editFormData.role;
        }
        if (editFormData.level && editFormData.level !== originalData?.level) {
            changedFields.level = editFormData.level;
        }
        // Solo agregar password si se ingresó algo
        if (editFormData.password && editFormData.password.trim() !== "") {
            changedFields.password = editFormData.password;
        }

        // Si no hay cambios, cerrar el dialog
        if (Object.keys(changedFields).length === 0) {
            toast.info("No hay cambios para guardar");
            setIsEditDialogOpen(false);
            return;
        }

        setLoading(true);
        try {
            await uploadUser(selectedUsuarioEmail, changedFields);
            toast.success("Usuario actualizado exitosamente");

            // Refrescar datos
            await detalleQuery.refetch();
            await refetchUsuarios();

            // Cerrar dialog
            setIsEditDialogOpen(false);
        } catch (error: any) {
            // Mostrar el error específico del backend
            const errorMessage = error.message || "Error al actualizar usuario";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header currentView={location.pathname.includes("users") ? "users" : ""} />
            <main className="flex-1 container mx-auto px-6 md:px-10 py-6 md:py-10 space-y-6 md:space-y-8">
                <header className="text-center md:text-left space-y-1">
                    <h1 className="text-3xl font-semibold">Administracion de Usuarios</h1>
                    <p className="text-muted-foreground">Gestiona todos los usuarios del sistema</p>
                </header>

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 md:text-lg">
                            <SlidersHorizontal className="h-5 w-5 text-primary" /> Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Búsqueda */}
                            <div className="space-y-2">
                                <Label>Búsqueda</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, email, mes, año, día..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Rol */}
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select
                                    value={String(filterRol)}
                                    onChange={(e) => setFilterRol(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="Usuario">Usuario</option>
                                    <option value="Administrador">Administrador</option>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumenes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Usuarios Activos Hoy */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 md:text-lg">
                                <Activity className="h-5 w-5 text-primary" />
                                Actividad Hoy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {/* Gráfico de Torta */}
                                <div className="relative w-24 h-24 flex-shrink-0">
                                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                        {/* Círculo de fondo */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="rgb(226, 232, 240)"
                                            strokeWidth="20"
                                        />
                                        {/* Círculo de progreso - Activos */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="rgb(34, 197, 94)"
                                            strokeWidth="20"
                                            strokeDasharray={`${(totalUsuariosActivosHoy / usuariosFiltrados.length) * 251.2} 251.2`}
                                            strokeLinecap="round"
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                    {/* Porcentaje central */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-lg font-bold text-foreground">
                                            {usuariosFiltrados.length > 0
                                                ? Math.round((totalUsuariosActivosHoy / usuariosFiltrados.length) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Leyenda */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-muted-foreground">Activos</span>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600">
                                            {totalUsuariosActivosHoy}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                            <span className="text-sm text-muted-foreground">Inactivos</span>
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            {usuariosFiltrados.length - totalUsuariosActivosHoy}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Total</span>
                                            <span className="text-sm font-bold text-foreground">
                                                {usuariosFiltrados.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gráfico de Barras - Usuarios por Nivel */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 md:text-lg">
                                <ArrowUp01 className="h-5 w-5 text-primary" />
                                Distribución por Nivel
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Nivel 1-20 */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Nivel 1-20</span>
                                        <span className="font-bold text-foreground">{usuariosPorNivel.nivel1_20}</span>
                                    </div>
                                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${(usuariosPorNivel.nivel1_20 / maxUsuariosPorNivel) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Nivel 21-40 */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Nivel 21-40</span>
                                        <span className="font-bold text-foreground">{usuariosPorNivel.nivel21_40}</span>
                                    </div>
                                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${(usuariosPorNivel.nivel21_40 / maxUsuariosPorNivel) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Nivel 41-60 */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Nivel 41-60</span>
                                        <span className="font-bold text-foreground">{usuariosPorNivel.nivel41_60}</span>
                                    </div>
                                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${(usuariosPorNivel.nivel41_60 / maxUsuariosPorNivel) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Nivel 61+ */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Nivel 61+</span>
                                        <span className="font-bold text-foreground">{usuariosPorNivel.nivel61_mas}</span>
                                    </div>
                                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${(usuariosPorNivel.nivel61_mas / maxUsuariosPorNivel) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla - Desktop */}
                <Card className="hidden md:block">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 md:text-lg">
                            <UsersRound className="h-5 w-5 text-primary" /> Usuarios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg">
                            {isLoadingUsuarios ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                                </div>
                            ) : isErrorUsuarios ? (
                                <div className="text-destructive py-8 text-center">Error al cargar usuarios</div>
                            ) : usuariosFiltrados.length === 0 ? (
                                <div className="text-muted-foreground py-8 text-center">
                                    No se encontraron usuarios
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                                Nombre de Usuario
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                                Rol
                                            </th>
                                            <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                                Última Actividad
                                            </th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {usuariosFiltrados.map((usuario) => (
                                            <tr
                                                key={usuario.email}
                                                className="group cursor-pointer border-b border-border hover:bg-primary/10 transition-colors"
                                                onClick={() => openDetailDialog(usuario.email)}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm group-hover:text-primary">
                                                            {usuario.userName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="max-w-xs truncate font-medium text-sm group-hover:text-primary">
                                                        {usuario.email}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${usuario.role === "Administrador"
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'bg-secondary/10 text-secondary border border-secondary/20'
                                                        }`}>
                                                        {usuario.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-medium text-center text-sm group-hover:text-primary">
                                                    {new Date(usuario.lastActive).toLocaleDateString("es-AR")}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${usuario.isActive === true
                                                        ? 'bg-active/10 text-active border border-active/20'
                                                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                                                        }`}>
                                                        {usuario.isActive ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile */}
                <div className="md:hidden space-y-4">
                    {isLoadingUsuarios ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                        </div>
                    ) : isErrorUsuarios ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-destructive text-center">Error al cargar usuarios</p>
                            </CardContent>
                        </Card>
                    ) : usuariosFiltrados.length === 0 ? (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-muted-foreground text-center">No se encontraron usuarios</p>
                            </CardContent>
                        </Card>
                    ) : usuariosFiltrados.map((usuario) => (
                            <Card
                                key={usuario.email}
                                className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/50"
                                onClick={() => openDetailDialog(usuario.email)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm text-foreground font-medium mb-1">
                                                @{usuario.userName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {usuario.email}
                                            </p>
                                        </div>
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${usuario.role === "Administrador"
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-secondary/10 text-secondary border border-secondary/20'
                                            }`}>
                                            {usuario.role}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Última Actividad</p>
                                        <p className="text-sm text-foreground font-medium">
                                            {new Date(usuario.lastActive).toLocaleDateString("es-AR")}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    }
                </div>

                {/* Dialog detalle */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogClose onClose={() => setIsDetailDialogOpen(false)} />
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Detalle del Usuario
                            </DialogTitle>
                        </DialogHeader>

                        {detalleQuery.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                            </div>
                        ) : detalleQuery.isError ? (
                            <div className="text-destructive p-4">Error al cargar detalle del usuario</div>
                        ) : detalleQuery.data ? (
                            <div className="space-y-6 px-6 pb-6">
                                {/* Header con Avatar y Datos Principales */}
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b">
                                    {/* Avatar */}
                                    <div className="relative mt-4">
                                        {/* Contenedor del borde con gradiente */}
                                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-r from-primary to-accent shadow-lg">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                <img
                                                    src={detalleQuery.data.profile.avatarUrl || "https://api.dicebear.com/7.x/big-smile/svg?seed=Default"}
                                                    alt={detalleQuery.data.profile.displayName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        {/* Badge de Nivel */}
                                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                                            Nivel {detalleQuery.data.level}
                                        </div>
                                    </div>

                                    {/* Información Principal */}
                                    <div className="flex-1 text-center md:text-left space-y-3 mt-1">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{detalleQuery.data.userName}</h2>
                                            <p className="text-sm text-primary font-semibold">@{detalleQuery.data.profile.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{detalleQuery.data.email}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                            {/* Badge de Rol */}
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${detalleQuery.data.role === "Administrador"
                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                    : 'bg-secondary/10 text-secondary border border-secondary/20'
                                                }`}>
                                                <CircleUserRound className="h-3 w-3" />
                                                {detalleQuery.data.role}
                                            </span>

                                            {/* Badge de Privacidad */}
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-gray-400`}>
                                                {detalleQuery.data.profile.isPublic ? '🌐 Público' : '🔒 Privado'}
                                            </span>

                                            {/* Ubicación */}
                                            {detalleQuery.data.profile.zone && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-active border border-secondary/20">
                                                    <MapPin className="h-3 w-3" />
                                                    {detalleQuery.data.profile.zone}
                                                </span>
                                            )}
                                        </div>

                                        {/* Última Actividad */}
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <span>Última actividad: {new Date(detalleQuery.data.lastActive).toLocaleDateString("es-AR", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas */}
                                <div>
                                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold">
                                        <ChartColumn className="h-5 w-5 text-primary" />
                                        Estadísticas
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Puntos Totales */}
                                        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                                            <CardContent className="pt-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <GamepadDirectional className="h-5 w-5 text-primary" />
                                                        <p className="text-xs text-primary font-medium">Pts. Totales</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-primary text-center">{detalleQuery.data.stats.totalPoints || 0}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Puntos Semanales */}
                                        <Card className="bg-gradient-to-br from-teal-500/5 to-teal-500/10 border-teal-500/20">
                                            <CardContent className="pt-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="h-5 w-5 text-secondary" />
                                                        <p className="text-xs text-secondary font-medium">Pts. Semanales</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-secondary text-center">{detalleQuery.data.stats.weeklyPoints || 0}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Desafíos Completados */}
                                        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                                            <CardContent className="pt-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-5 w-5 text-accent" />
                                                        <p className="text-xs text-accent font-medium">Completados</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-accent text-center">{detalleQuery.data.stats.totalCompleted || 0}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Racha Actual */}
                                        <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
                                            <CardContent className="pt-4 pb-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="h-5 w-5 text-yellow-600" />
                                                        <p className="text-xs text-yellow-600 font-medium">Racha Actual</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-yellow-600 text-center">{detalleQuery.data.stats.currentStreak || 0}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-t border-border"></div>

                                {/* Acciones */}
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                                        {/* Botón Modificar */}
                                        <button 
                                            onClick={handleOpenEditDialog}
                                            className="sm:w-auto px-1 py-2 text-sm flex items-center justify-center gap-2 bg-transparent border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                                        >
                                            <PencilLine className="h-5 w-5" />
                                            Modificar usuario
                                        </button>

                                        {/* Botón Eliminar/Dar de Alta según estado */}
                                        {detalleQuery.data.isActive ? (
                                            <button 
                                                onClick={() => handleStatusChange('deactivate')}
                                                className="sm:w-auto px-1 py-2 text-sm flex items-center justify-center gap-2 bg-transparent border-2 border-destructive text-destructive rounded-lg font-medium hover:bg-destructive hover:text-white transition-colors"
                                            >
                                                <UserX className="h-5 w-5" />
                                                Dar de Baja
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleStatusChange('activate')}
                                                className="sm:w-auto px-1 py-2 text-sm flex items-center justify-center gap-2 bg-transparent border-2 border-active text-active rounded-lg font-medium hover:bg-active hover:text-white transition-colors"
                                            >
                                                <UserCheck className="h-5 w-5" />
                                                Dar de Alta
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>

                {/* Modal de confirmación para cambio de estado */}
                <Dialog open={showStatusChangeConfirm} onOpenChange={setShowStatusChangeConfirm}>
                    <DialogContent className="max-w-md">
                        <DialogClose onClose={handleStatusChangeCancel} />
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {statusChangeAction === 'deactivate' ? (
                                    <>
                                        <UserX className="h-5 w-5 text-destructive" />
                                        Dar de Baja Usuario
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-5 w-5 text-active" />
                                        Dar de Alta Usuario
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 px-6 pb-6 pt-4">
                            <p className="text-sm text-muted-foreground">
                                {statusChangeAction === 'deactivate' 
                                    ? '¿Estás seguro de que deseas dar de baja a este usuario? El usuario no podrá acceder al sistema hasta que sea reactivado.'
                                    : '¿Estás seguro de que deseas dar de alta a este usuario? El usuario podrá volver a acceder al sistema.'
                                }
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleStatusChangeCancel}
                                    className="flex-1 px-2 py-1 border-2 border-border text-muted-foreground text-sm rounded-lg font-medium hover:text-black hover:border-black transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleStatusChangeConfirm}
                                    className={`flex-1 px-2 py-1 text-sm rounded-lg font-medium transition-colors ${
                                        statusChangeAction === 'deactivate'
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
                                        statusChangeAction === 'deactivate' ? 'Aceptar baja' : 'Aceptar alta'
                                    )}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog de edición de usuario */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogClose onClose={() => setIsEditDialogOpen(false)} />
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <PencilLine className="h-5 w-5 text-primary" />
                                Modificar Usuario
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 px-6 pb-6 pt-6">
                            {/* Nombre de Usuario */}
                            <div className="space-y-2">
                                <Label htmlFor="userName">Nombre de Usuario</Label>
                                <Input
                                    id="userName"
                                    value={editFormData.userName || ""}
                                    onChange={(e) => handleEditFormChange("userName", e.target.value)}
                                    placeholder="Nombre completo"
                                />
                            </div>

                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Nombre para Mostrar</Label>
                                <Input
                                    id="displayName"
                                    value={editFormData.displayName || ""}
                                    onChange={(e) => handleEditFormChange("displayName", e.target.value)}
                                    placeholder="@nickname"
                                />
                            </div>

                            {/* Zona con Select */}
                            <div className="space-y-2">
                                <Label htmlFor="zone">Ubicación</Label>
                                <Select
                                    id="zone"
                                    value={editFormData.zone || ""}
                                    onChange={(e) => handleEditFormChange("zone", e.target.value)}
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

                            {/* Grid para Rol, Nivel y Privacidad */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Rol */}
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Select
                                        id="role"
                                        value={editFormData.role || "Usuario"}
                                        onChange={(e) => handleEditFormChange("role", e.target.value)}
                                    >
                                        <option value="Usuario">Usuario</option>
                                        <option value="Administrador">Administrador</option>
                                    </Select>
                                </div>

                                {/* Nivel */}
                                <div className="space-y-2">
                                    <Label htmlFor="level">Nivel</Label>
                                    <Input
                                        id="level"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={editFormData.level || 1}
                                        onChange={(e) => handleEditFormChange("level", parseInt(e.target.value))}
                                    />
                                </div>

                                {/* Privacidad */}
                                <div className="space-y-2">
                                    <Label htmlFor="isPublic">Perfil</Label>
                                    <Select
                                        id="isPublic"
                                        value={editFormData.isPublic ? "true" : "false"}
                                        onChange={(e) => handleEditFormChange("isPublic", e.target.value === "true")}
                                    >
                                        <option value="true">🌐 Público</option>
                                        <option value="false">🔒 Privado</option>
                                    </Select>
                                </div>
                            </div>

                            {/* Contraseña (opcional) */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={editFormData.password || ""}
                                    onChange={(e) => handleEditFormChange("password", e.target.value)}
                                    placeholder="Dejar vacío para mantener la actual"
                                />
                                <p className="text-xs text-muted-foreground">Solo completa este campo si deseas cambiar la contraseña</p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="flex-1 px-2 py-1 text-sm border-2 border-border text-muted-foreground rounded-lg font-medium hover:text-black hover:border-black transition-colors"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveUserChanges}
                                    className="flex-1 px-2 py-1 text-sm bg-transparent border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Guardando...
                                        </div>
                                    ) : (
                                        "Guardar Cambios"
                                    )}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}