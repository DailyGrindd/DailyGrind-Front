import { Button } from "../components/button";
import { LayoutDashboard, Heart, Award, Zap, Users, CircleUserRound, TrendingUp, LogOut, Menu, X, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { logoutThunk, clearAuthState } from "../store/authSlice";

interface HeaderProps {
    currentView: string;
}
        
export function Header({ currentView }: HeaderProps) {
    const dispatch = useDispatch<any>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const isAdmin = user?.role === "Administrador";

    const menuItems = isAdmin
        ? [
            { id: "challenge-admin", label: "Desafíos", icon: Zap, path: "/challengesAdmin" },
            { id: "badge", label: "Logros", icon: Award, path: "/badges" },
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            { id: "users", label: "Usuarios", icon: Users, path: "/users" },
        ]
        : [
            { id: "home", label: "Inicio", icon: CalendarCheck, path: "/home" },
            { id: "profile", label: "Mi Perfil", icon: CircleUserRound, path: "/profile" },
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

                    {/* User Info + Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                            <p className="text-xs text-muted-foreground">{`Nivel ${user?.level} • ${user?.totalPoints} pts`}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="hidden md:flex gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b border-border">
                    <nav className="container mx-auto px-4 py-3 space-y-2">
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
                        <div className="pt-2 border-t mt-2">
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
            )}
        </>
    );
}
