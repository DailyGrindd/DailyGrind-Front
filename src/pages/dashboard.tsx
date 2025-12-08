import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "../components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Loader2, ContactRound, CheckCircle2, XCircle, Clock, Globe, Ticket, ListTodo, MapPin, BarChart3 } from "lucide-react";
import { getDailyStats, getMissionsTypeStats } from "../services/dailyQuestServices";
import { obtenerInfoZones } from "../services/userServices";
import { getCategoryStats } from "../services/challengeServices";
import { ProvinceChart } from "../components/province-chart";
import { CategoryChart } from "../components/category-chart";

export function Dashboard() {
  const location = useLocation();

  // Obtener estadísticas diarias
  const { data: dailyStats, isLoading: isLoadingDaily, isError: isErrorDaily } = useQuery({
    queryKey: ["dailyStats"],
    queryFn: getDailyStats,
  });

  // Obtener estadísticas por tipo de misión
  const { data: typeStats, isLoading: isLoadingType, isError: isErrorType } = useQuery({
    queryKey: ["missionsTypeStats"],
    queryFn: getMissionsTypeStats,
  });

  // Obtener estadísticas por zona
  const { data: zoneStats, isLoading: isLoadingZones, isError: isErrorZones } = useQuery({
    queryKey: ["zoneStats"],
    queryFn: obtenerInfoZones,
  });

  // Obtener estadísticas por categoría
  const { data: categoryStats, isLoading: isLoadingCategory, isError: isErrorCategory } = useQuery({
    queryKey: ["categoryStats"],
    queryFn: getCategoryStats,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header currentView={location.pathname.includes("dashboard") ? "dashboard" : ""} />

      <main className="flex-1 container mx-auto px-6 md:px-10 py-6 md:py-10 space-y-6 md:space-y-8">
        <header className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-semibold">Dashboard General</h1>
          <p className="text-muted-foreground">Visualiza las estadísticas y progreso del sistema</p>
        </header>

        {/* Gráfico 1: Resumen de Misiones Diarias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 md:text-lg">
              <ListTodo className="h-5 w-5 text-primary" />
              Resumen de Misiones
            </CardTitle>
            <CardDescription className="text-muted-foreground">Estado de las misiones de los últimos 15 días</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDaily ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : isErrorDaily ? (
              <div className="text-destructive py-12 text-center">
                Error al cargar estadísticas diarias
              </div>
            ) : dailyStats ? (
              <div className="md:space-y-6">
                {/* Barras horizontales con totales - Solo Desktop */}
                <div className="hidden md:block space-y-4">
                  {/* Completadas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-foreground">Completadas</span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-secondary/20 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: dailyStats.averageCompleted }}
                      >
                        <span className="text-xs text-white font-bold">
                          {dailyStats.averageCompleted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pendientes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-foreground">Pendientes</span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-secondary/20 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: dailyStats.averagePending }}
                      >
                        <span className="text-xs text-white font-bold">
                          {dailyStats.averagePending}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skipeadas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-foreground">Salteadas</span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-secondary/20 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-end px-3 transition-all duration-500"
                        style={{ width: dailyStats.averageSkipped }}
                      >
                        <span className="text-xs text-white font-bold">
                          {dailyStats.averageSkipped}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards de resumen */}
                <div className="md:pt-4 md:border-t md:border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* Completadas */}
                    <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-600 font-medium">Completadas</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {dailyStats.totalCompleted}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {dailyStats.averageCompleted}
                        </div>
                      </div>
                    </div>

                    {/* Pendientes */}
                    <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm text-yellow-600 font-medium">Pendientes</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">
                          {dailyStats.totalPending}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {dailyStats.averagePending}
                        </div>
                      </div>
                    </div>

                    {/* Salteadas */}
                    <div className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-600 font-medium">Salteadas</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {dailyStats.totalSkipped}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {dailyStats.averageSkipped}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Gráfico 2: Misiones Globales vs Personales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 md:text-lg">
              <Ticket className="h-5 w-5 text-primary" />
              Tipos de Misiones
            </CardTitle>
            <CardDescription className="text-muted-foreground">Utilizacion de cada tipo de mision</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingType ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : isErrorType ? (
              <div className="text-destructive py-12 text-center">
                Error al cargar estadísticas por tipo
              </div>
            ) : typeStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Misiones Globales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-lg font-semibold text-foreground gap-2">
                      <Globe className="h-6 w-6 text-primary" />
                       Globales
                    </h3>
                    <span className="text-2xl font-bold text-primary">
                      {typeStats.global.percentageCompleted}
                    </span>
                  </div>

                  {/* Gráfico circular */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(226, 232, 240)"
                        strokeWidth="12"
                      />
                      {/* Círculo de progreso */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(59, 130, 246)"
                        strokeWidth="12"
                        strokeDasharray={`${(typeStats.global.completed / typeStats.global.total) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Porcentaje central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold text-primary">
                        {typeStats.global.completed}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        de {typeStats.global.total}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total asignadas</span>
                      <span className="font-semibold text-foreground">{typeStats.global.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completadas</span>
                      <span className="font-semibold text-primary">{typeStats.global.completed}</span>
                    </div>
                  </div>
                </div>

                {/* Misiones Personales */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-lg font-semibold text-foreground gap-2">
                      <ContactRound className="h-6 w-6 text-secondary" />
                       Personales
                    </h3>
                    <span className="text-2xl font-bold text-secondary">
                      {typeStats.personal.percentageCompleted}
                    </span>
                  </div>

                  {/* Gráfico circular */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Círculo de fondo */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(226, 232, 240)"
                        strokeWidth="12"
                      />
                      {/* Círculo de progreso */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgb(20, 184, 166)"
                        strokeWidth="12"
                        strokeDasharray={`${(typeStats.personal.completed / typeStats.personal.total) * 251.2} 251.2`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Porcentaje central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl md:text-2xl font-bold text-secondary">
                        {typeStats.personal.completed}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        de {typeStats.personal.total}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total asignadas</span>
                      <span className="font-semibold text-foreground">{typeStats.personal.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Completadas</span>
                      <span className="font-semibold text-secondary">{typeStats.personal.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Gráfico 3: Distribución de Usuarios por Provincia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 md:text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Distribución por Provincias
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              <span className="md:hidden">
                Top 3 provincias con más usuarios
              </span>
              <span className="hidden md:inline">
                Top 10 provincias con más usuarios y resumen estadístico
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingZones ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : isErrorZones ? (
              <div className="text-destructive py-12 text-center">
                Error al cargar estadísticas por provincia
              </div>
            ) : zoneStats ? (
              <ProvinceChart data={zoneStats.data} />
            ) : null}
          </CardContent>
        </Card>

        {/* Gráfico 4: Estadísticas por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 md:text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Desafíos por Categoría
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Asignaciones y completaciones por cada categoría de desafíos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCategory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : isErrorCategory ? (
              <div className="text-destructive py-12 text-center">
                Error al cargar estadísticas por categoría
              </div>
            ) : categoryStats ? (
              <CategoryChart data={categoryStats.data} />
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}