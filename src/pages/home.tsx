import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Button } from "../components/button";
import { Heart, Flame, TrendingUp, Calendar, Zap, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Si el usuario está autenticado, redirigir a /daily
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/daily");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Header simple para landing */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-accent rounded-lg p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-foreground font-bold text-2xl">DailyGrind</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Iniciar Sesión
            </Button>
            <Button onClick={() => navigate("/register")}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Transforma tu vida con
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> pequeños hábitos diarios</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Completa desafíos de salud y bienestar, gana puntos, sube de nivel y compite con tu comunidad. 
              ¡Haz del bienestar un juego!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/register")}>
                <Zap className="h-5 w-5 mr-2" />
                Comenzar Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate("/login")}>
                Ya tengo cuenta
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/50 backdrop-blur-sm py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-white shadow-lg">
                <div className="bg-gradient-to-br from-primary to-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Misiones Diarias</h3>
                <p className="text-muted-foreground">
                  Recibe 3 desafíos globales cada día y asigna hasta 2 desafíos personalizados
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-white shadow-lg">
                <div className="bg-gradient-to-br from-primary to-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gana Puntos</h3>
                <p className="text-muted-foreground">
                  Completa desafíos para ganar puntos, subir de nivel y desbloquear logros
                </p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-white shadow-lg">
                <div className="bg-gradient-to-br from-primary to-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Compite</h3>
                <p className="text-muted-foreground">
                  Sube en el ranking y comparte tus desafíos con la comunidad
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Categorías de Desafíos</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
              {[
                { icon: "💪", name: "Ejercicio Físico" },
                { icon: "🥗", name: "Alimentación" },
                { icon: "💧", name: "Hidratación" },
                { icon: "😴", name: "Descanso" },
                { icon: "🧠", name: "Salud Mental" },
                { icon: "📅", name: "Hábitos" }
              ].map((category, idx) => (
                <div key={idx} className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition">
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <p className="font-semibold text-sm">{category.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary to-accent py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">¿Listo para comenzar tu transformación?</h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de usuarios que ya están mejorando su salud día a día
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={() => navigate("/register")}>
              <CheckCircle className="h-5 w-5 mr-2" />
              Crear Cuenta Gratis
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t py-8">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2025 DailyGrind. Transformando vidas, un día a la vez.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}