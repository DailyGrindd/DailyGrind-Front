import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { CategoryStats } from "../types/challenge";

interface CategoryChartProps {
    data: CategoryStats[];
}

// Mapeo de categorías a emojis (mismo orden que en home)
const CATEGORY_EMOJIS: Record<string, string> = {
    "Ejercicio Físico": "💪",
    "Alimentación Saludable": "🥗",
    "Hidratación": "💧",
    "Descanso": "😴",
    "Salud Mental": "🧠",
    "Hábitos Diarios": "📅",
    "Salud": "❤️",
};

// Colores para las barras
const COLORS = {
    assigned: "#3b82f6",
    completed: "#22c55e",
};

export function CategoryChart({ data }: CategoryChartProps) {
    // Transformar datos para el gráfico
    const chartData = data.map(item => ({
        category: item.category,
        emoji: CATEGORY_EMOJIS[item.category] || "📊",
        Asignados: item.totalAssigned,
        Completados: item.totalCompleted,
        total: item.totalChallenges,
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-lg">
                    <p className="font-bold text-xl mb-2 flex items-center gap-2">
                        <span className="text-2xl">{data.emoji}</span>
                        {data.category}
                    </p>
                    <div className="space-y-1">
                        <p className="text-blue-300">
                            <span className="font-semibold">Asignados:</span> {data.Asignados}
                        </p>
                        <p className="text-green-300">
                            <span className="font-semibold">Completados:</span> {data.Completados}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Para mostrar emoji en el eje X
    const CustomXAxisTick = ({ x, y, payload }: any) => {
        const item = chartData.find(d => d.category === payload.value);
        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={20}
                >
                    {item?.emoji}
                </text>
                <text
                    x={0}
                    y={24}
                    dy={12}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={9}
                    className="hidden md:block"
                >
                    {payload.value.length > 15 ? payload.value.substring(0, 12) + '...' : payload.value}
                </text>
            </g>
        );
    };

    // Custom legend
    const CustomLegend = () => {
        return (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Asignados</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completados</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Gráfico de Barras */}
            <div className="hidden md:block -mb-8">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 50 }}
                        barSize={30}
                        barGap={4}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey="category"
                            tick={<CustomXAxisTick />}
                            height={60}
                            interval={0}
                        />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.1)" }} />
                        <Bar dataKey="Asignados" fill={COLORS.assigned} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Completados" fill={COLORS.completed} radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="hidden md:block mb-6">
                <CustomLegend />
            </div>

            {/* Vista Mobile - Cards con barras */}
            <div className="md:hidden space-y-3">
                {chartData.map((item, index) => {
                    const completionRate = item.Asignados > 0
                        ? ((item.Completados / item.Asignados) * 100).toFixed(0)
                        : "0";

                    return (
                        <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                        <h3 className="font-semibold text-sm">{item.category}</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-bold text-green-500">{completionRate}%</div>
                                    <div className="text-xs text-muted-foreground">completado</div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {/* Barra Asignados */}
                                <div>
                                    <div className="flex justify-between text-xs mb-0.5">
                                        <span className="text-blue-500 font-medium">Asignados</span>
                                        <span className="font-bold">{item.Asignados}</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: item.Asignados > 0
                                                    ? `${Math.min((item.Asignados / Math.max(...chartData.map(d => d.Asignados))) * 100, 100)}%`
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Barra Completados */}
                                <div>
                                    <div className="flex justify-between text-xs mb-0.5">
                                        <span className="text-green-500 font-medium">Completados</span>
                                        <span className="font-bold">{item.Completados}</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: item.Completados > 0
                                                    ? `${Math.min((item.Completados / Math.max(...chartData.map(d => d.Completados))) * 100, 100)}%`
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resumen estadístico */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Total Asignados</div>
                    <div className="text-2xl font-bold text-blue-500">
                        {data.reduce((sum, item) => sum + item.totalAssigned, 0)}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Total Completados</div>
                    <div className="text-2xl font-bold text-green-500">
                        {data.reduce((sum, item) => sum + item.totalCompleted, 0)}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 col-span-2 md:col-span-1">
                    <div className="text-xs text-muted-foreground mb-1">Tasa Completado</div>
                    <div className="text-2xl font-bold text-purple-500">
                        {(() => {
                            const totalAssigned = data.reduce((sum, item) => sum + item.totalAssigned, 0);
                            const totalCompleted = data.reduce((sum, item) => sum + item.totalCompleted, 0);
                            return totalAssigned > 0 ? `${((totalCompleted / totalAssigned) * 100).toFixed(0)}%` : "0%";
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}