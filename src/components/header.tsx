import { Button } from "../components/button";
import { 
  LayoutDashboard, Heart, Award, Zap, Users, 
  TrendingUp, LogOut, Menu, X, CalendarCheck, Search 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { logoutThunk, clearAuthState } from "../store/authSlice";
import { searchPublicProfile } from "../services/userSearchService";
import type { SearchUser } from "../types/user";

interface HeaderProps {
    currentView: string;
}
        
export function Header({ currentView }: HeaderProps) {
    const dispatch = useDispatch<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const isAdmin = user?.role === "Administrador";
    // cerrar el dropdown de busqueda al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buscar usuarios cuando el usuario escribe
    useEffect(() => {
        const search = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setSearchLoading(true);
            try {
                const results = await searchPublicProfile(searchQuery);
                setSearchResults(results);
            } catch (err) {
                console.error("Error buscando usuarios:", err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    //navega al perfil y limpia buscador
    const handleUserClick = (userName: string) => {
        navigate(`/profile/public/${userName}`);
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const menuItems = isAdmin
        ? [
            { id: "challenge-admin", label: "Desafíos", icon: Zap, path: "/challengesAdmin" },
            { id: "badge", label: "Logros", icon: Award, path: "/badges" },
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            { id: "users", label: "Usuarios", icon: Users, path: "/users" },
        ]
        : [
            { id: "daily", label: "Diario", icon: CalendarCheck, path: "/daily" },
            { id: "challenges", label: "Desafíos", icon: Zap, path: "/challenges" },
            { id: "ranking", label: "Ranking", icon: TrendingUp, path: "/ranking" },
        ];

    const handleNavigate = (item: (typeof menuItems)[number]) => {
        navigate(item.path);
        setMobileMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk()).unwrap();
        } catch (err) {
            console.error("Error en logout:", err);
        } finally {
            dispatch(clearAuthState());
            navigate("/login", { replace: true });
        }
    }

    return (
        <>
            <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isAdmin ? navigate("/home") : navigate("/dashboard")}>
                        <div className="bg-gradient-to-br from-primary to-accent rounded-lg p-2">
                            <Heart className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-foreground font-bold text-xl hidden sm:block">DailyGrind</h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;

                            return (
                                <Button
                                    key={item.id}
                                    variant={isActive ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => handleNavigate(item)}
                                    className="gap-2">
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            );
                        })}
                    </nav>

                     {/* Buscador - Solo para usuarios normales */}
                    {!isAdmin && (
                        <div className="relative hidden md:block" ref={searchRef}>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setSearchOpen(true)}
                                    className="w-64 px-4 py-2 pl-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>

                            {/* Resultados de búsqueda */}
                            {searchOpen && searchQuery.length >= 2 && (
                                <div className="absolute top-full mt-2 w-full bg-white border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                    {searchLoading ? (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            Buscando...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result) => (
                                                <button
                                                    key={result._id}
                                                    onClick={() => handleUserClick(result.userName)}
                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                                        {(result.profile?.displayName || result.userName).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-medium text-foreground">{result.profile?.displayName || result.userName}</p>
                                                        <p className="text-xs text-muted-foreground">Nivel {result.level}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            No se encontraron usuarios
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {/* User Info + Logout - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Avatar + User Info - Clickeable */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate("/profile")}
                        >
                            {/* Avatar */}
                            {user?.avatarUrl && (
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-active bg-white flex items-center justify-center p-0.5">
                                    <img 
                                        src={user.avatarUrl} 
                                        alt={user.displayName || "Avatar"} 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                            
                            {/* User Info */}
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                                <p className="text-xs text-muted-foreground">{`Nivel ${user?.level} • ${user?.totalPoints} pts`}</p>
                            </div>
                        </div>
                        
                        {/* Logout Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-border">
                    <div className="container mx-auto px-4 py-3">
                        {/* User Info Mobile - Clickeable */}
                        <div 
                            className="flex items-center gap-3 pb-3 mb-3 border-b cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                            onClick={() => {
                                navigate("/profile");
                                setMobileMenuOpen(false);
                            }}
                        >
                            {/* Avatar */}
                            {user?.avatarUrl && (
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-active bg-white flex items-center justify-center p-1">
                                    <img 
                                        src={user.avatarUrl} 
                                        alt={user.displayName || "Avatar"} 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                            
                            {/* User Info */}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                                <p className="text-xs text-muted-foreground">{`Nivel ${user?.level} • ${user?.totalPoints} pts`}</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentView === item.id;
                                return (
                                    <Button
                                        key={item.id}
                                        variant={isActive ? "default" : "ghost"}
                                        className="w-full justify-start gap-2"
                                        onClick={() => handleNavigate(item)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                );
                            })}
                            
                            {/* Logout Button */}
                            <div className="pt-2 border-t">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar Sesión
                                </Button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
