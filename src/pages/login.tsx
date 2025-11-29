import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Label } from "../components/label";
import { toast } from "sonner";
import { loginThunk } from "../store/authSlice";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { LoginRequest } from "../types/user";

export function Login() {
    const hasShownError = useRef(false);
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, error } = useSelector(
        (state: RootState) => state.auth
    );
    const { register, handleSubmit } = useForm<LoginRequest>();

    useEffect(() => {
        if (isAuthenticated && user) {
            toast.success("¡Bienvenido a DailyGrind!");
            if (user.role === "Administrador") navigate("/dashboard", { replace: true });
            else navigate("/home", { replace: true });
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (error && !hasShownError.current) {
            toast.error(error);
            hasShownError.current = true;
        }
    }, [error]);

    const onSubmit = (data: LoginRequest) => {
        dispatch(loginThunk(data));
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
                                <span className="bg-card px-2 text-muted-foreground">O</span>
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