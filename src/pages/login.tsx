import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Label } from "../components/label";
import { toast } from "sonner";
import { loginThunk, loginWithGoogleThunk, clearAuthError } from "../store/authSlice";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { LoginRequest } from "../types/user";

export function Login() {
    const hasShownError = useRef(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, error } = useSelector(
        (state: RootState) => state.auth
    );
    const { register, handleSubmit } = useForm<LoginRequest>();

    useEffect(() => {
        if (isAuthenticated && user) {
            setGoogleLoading(false);
            toast.success("¡Bienvenido a DailyGrind!");
            if (user.role === "Administrador") navigate("/dashboard", { replace: true });
            else navigate("/home", { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (error && !hasShownError.current) {
            setGoogleLoading(false);
            
            // Ignorar si el usuario canceló el popup
            if (error === 'POPUP_CANCELLED') {
                hasShownError.current = true;
                // Limpiar el error después de un momento para permitir reintento
                setTimeout(() => {
                    dispatch(clearAuthError());
                    hasShownError.current = false;
                }, 100);
                return;
            }
            
            // Si el error es que el usuario no existe, redirigir al registro sin mostrar toast
            if (error.includes("Usuario no encontrado") || error.includes("Debes registrarte")) {
                navigate("/register", { state: { fromGoogleLogin: true } });
            } else {
                toast.error(error);
            }
            hasShownError.current = true;
        }
    }, [error, navigate, dispatch]);

    const onSubmit = (data: LoginRequest) => {
        dispatch(loginThunk(data));
    };

    const handleGoogleLogin = async () => {
        hasShownError.current = false;
        setGoogleLoading(true);
        try {
            await dispatch(loginWithGoogleThunk());
        } finally {
            // Siempre resetear el loading después de que termine
            setTimeout(() => setGoogleLoading(false), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl items-center">
                {/* Left: Branding */}
                <div className="hidden md:flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 w-fit shadow-lg">
                            <Heart className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-foreground">DailyGrind</h1>
                            <p className="text-xl text-muted-foreground mt-2">Construye hábitos saludables, día a día</p>
                        </div>
                    </div>
                    <div className="space-y-3 pt-4">
                        <div className="flex gap-3 items-start">
                            <Heart className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Desafíos Personalizados</p>
                                <p className="text-sm text-muted-foreground">Adaptados a tu nivel de salud</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Activity className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Trackea tu Progreso</p>
                                <p className="text-sm text-muted-foreground">Visualiza tu mejora diaria</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <Activity className="h-5 w-5 text-secondary mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Compite y Crece</p>
                                <p className="text-sm text-muted-foreground">Con tu comunidad de salud</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Login Form */}
                <Card className="w-full shadow-lg border-border">
                    <CardHeader className="space-y-2">
                        <div className="flex md:hidden justify-center mb-2">
                            <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-3">
                                <Heart className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Inicia Sesión</CardTitle>
                        <CardDescription className="text-center">Accede a tu cuenta DailyGrind</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(
                            onSubmit, (formErrors) => {
                                Object.values(formErrors).forEach((err) => {
                                    if (err?.message) toast.error(err.message);
                                });
                            }
                        )} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    disabled={loading}
                                    {...register("email")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    {...register("password")}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Iniciando..." : "Iniciar Sesión"}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={googleLoading || loading}
                            onClick={handleGoogleLogin}
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {googleLoading ? "Autenticando..." : "Continuar con Google"}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                        </div>

                        {/* Register Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            ¿No tienes cuenta?{" "}
                            <button 
                                type="button"
                                onClick={() => navigate("/register")}
                                className="text-primary hover:text-primary-hover font-semibold"
                            >
                                Regístrate aquí
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}