import { useEffect, useRef, useState } from "react";
import { Heart, Activity, UserPlus, ArrowRight, ArrowLeft, User, MapPin, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Input } from "../components/input";
import { Select } from "../components/select";
import { Button } from "../components/button";
import { Label } from "../components/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { RegisterRequest } from "../types/user";
import { register, checkAvailability } from "../services/userServices";

const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Felix",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Luna",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Max",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Milo",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Bella",
    "https://api.dicebear.com/7.x/big-smile/svg?seed=Oliver",
];

export function Register() {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [availabilityErrors, setAvailabilityErrors] = useState<{ email?: string; userName?: string }>({});
    const hasShownError = useRef(false);
    const navigate = useNavigate();
    const { register: registerField, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm<RegisterRequest & { confirmPassword: string }>({
        mode: "onChange"
    });

    const password = watch("password");

    const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
        setLoading(true);
        hasShownError.current = false;

        const { confirmPassword, ...registerData } = data;
        const finalData = {
            ...registerData,
            avatarUrl: selectedAvatar,
            isPublic: String(data.isPublic) === "true"
        };

        try {
            const response = await register(finalData);
            toast.success(response.message || "¡Registro exitoso! Ahora puedes iniciar sesión");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (error: any) {
            if (!hasShownError.current) {
                toast.error(error.message || "Error al registrar usuario");
                hasShownError.current = true;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep = async () => {
        console.log("handleNextStep called, current step:", currentStep);
        console.log("Form errors:", errors);
        console.log("Form values:", getValues());
        
        let fieldsToValidate: any[] = [];
        
        if (currentStep === 1) {
            fieldsToValidate = ["userName", "displayName", "email", "password", "confirmPassword"];
        } else if (currentStep === 2) {
            fieldsToValidate = ["zone"];
        }

        const isValid = await trigger(fieldsToValidate);
        console.log("Form validation result:", isValid);
        console.log("Validation errors after trigger:", errors);
        
        if (isValid && currentStep === 1) {
            // Validar disponibilidad en el backend
            setLoading(true);
            setAvailabilityErrors({});
            try {
                const formData = getValues();
                const availability = await checkAvailability(formData.email, formData.userName);
                
                const newErrors: { email?: string; userName?: string } = {};
                
                if (availability?.email && !availability.email.available) {
                    newErrors.email = "El email ya está registrado";
                }
                
                if (availability?.userName && !availability.userName.available) {
                    newErrors.userName = "El nombre de usuario ya está en uso";
                }
                
                if (Object.keys(newErrors).length > 0) {
                    setAvailabilityErrors(newErrors);
                    setLoading(false);
                    return;
                }
                
                setLoading(false);
                setCurrentStep(prev => prev + 1);
            } catch (error: any) {
                console.error("Error checking availability:", error);
                setLoading(false);
                setAvailabilityErrors({ email: "Error al verificar disponibilidad" });
            }
        } else if (isValid) {
            console.log("Moving to next step (no validation needed)");
            setCurrentStep(prev => prev + 1);
        } else {
            console.log("Form validation failed");
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
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

                {/* Right: Register Form */}
                <Card className="w-full shadow-lg border-border">
                    <CardHeader className="space-y-2">
                        <div className="flex md:hidden justify-center mb-2">
                            <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-3">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Crear Cuenta</CardTitle>
                        <CardDescription className="text-center">Paso {currentStep} de 3</CardDescription>
                        
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                    currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                    1
                                </div>
                                <span className="text-xs mt-1 text-muted-foreground">Datos</span>
                            </div>
                            <div className={`h-1 flex-1 transition-colors ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                    currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                    2
                                </div>
                                <span className="text-xs mt-1 text-muted-foreground">Ubicación</span>
                            </div>
                            <div className={`h-1 flex-1 transition-colors ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                    currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                    3
                                </div>
                                <span className="text-xs mt-1 text-muted-foreground">Perfil</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(
                            onSubmit, (formErrors) => {
                                Object.values(formErrors).forEach((err) => {
                                    if (err?.message) toast.error(err.message);
                                });
                            }
                        )} className="space-y-4">
                            
                            {/* Step 1: Información Básica */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <User className="h-5 w-5" />
                                        <h3 className="font-semibold">Información de la Cuenta</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="userName">Nombre de Usuario</Label>
                                        <Input
                                            id="userName"
                                            type="text"
                                            placeholder="juanperez"
                                            disabled={loading}
                                            {...registerField("userName", { required: "El nombre de usuario es requerido" })}
                                        />
                                        {errors.userName && <p className="text-red-500 text-sm">{errors.userName.message}</p>}
                                        {availabilityErrors.userName && <p className="text-red-500 text-sm">{availabilityErrors.userName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Nombre para Mostrar</Label>
                                        <Input
                                            id="displayName"
                                            type="text"
                                            placeholder="Juan Pérez"
                                            disabled={loading}
                                            {...registerField("displayName", { required: "El nombre para mostrar es requerido" })}
                                        />
                                        {errors.displayName && <p className="text-red-500 text-sm">{errors.displayName.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@email.com"
                                            disabled={loading}
                                            {...registerField("email", { 
                                                required: "El email es requerido",
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Email inválido"
                                                }
                                            })}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                        {availabilityErrors.email && <p className="text-red-500 text-sm">{availabilityErrors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Contraseña</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            disabled={loading}
                                            {...registerField("password", { 
                                                required: "La contraseña es requerida",
                                                minLength: {
                                                    value: 6,
                                                    message: "La contraseña debe tener al menos 6 caracteres"
                                                }
                                            })}
                                        />
                                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            disabled={loading}
                                            {...registerField("confirmPassword", { 
                                                required: "Debes confirmar tu contraseña",
                                                validate: value => value === password || "Las contraseñas no coinciden"
                                            })}
                                        />
                                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                                    </div>

                                    <Button type="button" onClick={handleNextStep} className="w-full" disabled={loading}>
                                        {loading ? "Validando..." : "Siguiente"} <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: Ubicación */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <MapPin className="h-5 w-5" />
                                        <h3 className="font-semibold">Ubicación</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="zone">Provincia</Label>
                                        <Select
                                            id="zone"
                                            disabled={loading}
                                            {...registerField("zone", { required: "La provincia es requerida" })}
                                        >
                                            <option value="">Selecciona tu provincia</option>
                                            <option value="Buenos Aires">Buenos Aires</option>
                                            <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
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

                                    <div className="flex gap-2">
                                        <Button type="button" onClick={handlePrevStep} variant="outline" className="flex-1">
                                            <ArrowLeft className="h-4 w-4 mr-2" /> Atrás
                                        </Button>
                                        <Button type="button" onClick={handleNextStep} className="flex-1">
                                            Siguiente <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Avatar y Privacidad */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Image className="h-5 w-5" />
                                        <h3 className="font-semibold">Personaliza tu Perfil</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Elige tu Avatar</Label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {AVATAR_OPTIONS.map((avatar, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => setSelectedAvatar(avatar)}
                                                    className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                                                        selectedAvatar === avatar 
                                                            ? 'border-primary bg-primary/10' 
                                                            : 'border-border hover:border-primary/50'
                                                    }`}
                                                    disabled={loading}
                                                >
                                                    <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-auto rounded-md" />
                                                </button>
                                            ))}
                                        </div>
                                        {!selectedAvatar && (
                                            <p className="text-sm text-muted-foreground">Selecciona un avatar para continuar</p>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Label>Privacidad del Perfil</Label>
                                        <div className="space-y-2">
                                            <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    value="true"
                                                    disabled={loading}
                                                    {...registerField("isPublic")}
                                                    className="mt-0.5 h-4 w-4 text-primary focus:ring-2 focus:ring-ring"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Perfil Público</p>
                                                    <p className="text-xs text-muted-foreground">Otros usuarios podrán ver tu progreso y actividad</p>
                                                </div>
                                            </label>
                                            <label className="flex items-start gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors">
                                                <input
                                                    type="radio"
                                                    value="false"
                                                    disabled={loading}
                                                    {...registerField("isPublic")}
                                                    className="mt-0.5 h-4 w-4 text-primary focus:ring-2 focus:ring-ring"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Perfil Privado</p>
                                                    <p className="text-xs text-muted-foreground">Solo tú podrás ver tu información y progreso</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="button" onClick={handlePrevStep} variant="outline" className="flex-1">
                                            <ArrowLeft className="h-4 w-4 mr-2" /> Atrás
                                        </Button>
                                        <Button type="submit" className="flex-1" disabled={loading || !selectedAvatar}>
                                            {loading ? "Registrando..." : "Crear Cuenta"}
                                        </Button>
                                    </div>
                                </div>
                            )}
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

                        {/* Login Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            ¿Ya tienes cuenta?{" "}
                            <button 
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-primary hover:text-primary-hover font-semibold"
                            >
                                Inicia sesión aquí
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
