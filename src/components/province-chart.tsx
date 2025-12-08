import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProvinceData {
    zone: string;
    count: number;
}

interface ProvinceChartProps {
    data: ProvinceData[];
}

// Colores para el gráfico de torta (3 tonalidades de verde)
const COLORS = ["#15803d", "#22c55e", "#4ade80"];

export function ProvinceChart({ data }: ProvinceChartProps) {
    const [showAll, setShowAll] = useState(false);

    // Filtrar solo provincias con usuarios y ordenar
    const dataWithUsers = data.filter((p) => p.count > 0).sort((a, b) => b.count - a.count);

    // Mostrar top 10 o todas las provincias con usuarios (solo desktop)
    const displayDataDesktop = showAll ? dataWithUsers : dataWithUsers.slice(0, 10);

    // Top 3 para mobile (gráfico de torta)
    const displayDataMobile = dataWithUsers.slice(0, 3).map((item, index) => ({
        ...item,
        name: item.zone,
        value: item.count,
        fill: COLORS[index % COLORS.length],
    }));

    // Calcular porcentaje del total para mobile
    const totalMobile = displayDataMobile.reduce((sum, item) => sum + item.value, 0);

    // Función para obtener color según la cantidad (gráfico de barras) - Verde
    const getColor = (count: number) => {
        if (count === 0) return "#d1d5db"; // gray-300
        if (count <= 2) return "#86efac"; // green-300
        if (count <= 5) return "#4ade80"; // green-400
        if (count <= 10) return "#22c55e"; // green-500
        return "#15803d"; // green-700
    };

    // Custom tooltip para gráfico de barras
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-lg">
                    <p className="font-semibold">{payload[0].payload.zone}</p>
                    <p className="text-green-300">
                        {payload[0].value} usuario{payload[0].value !== 1 ? "s" : ""}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom tooltip para gráfico de torta
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalMobile) * 100).toFixed(1);
            return (
                <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-green-300">
                        {data.value} usuario{data.value !== 1 ? "s" : ""} ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Calcular altura dinámica para desktop
    const chartHeightDesktop = Math.max(400, displayDataDesktop.length * 50);

    return (
        <div className="w-full">
            {/* Botón para mostrar más/menos - Solo Desktop */}
            {dataWithUsers.length > 10 && (
                <div className="mb-4 hidden md:flex justify-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Mostrar Top 10
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Ver todas ({dataWithUsers.length})
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Gráfico de Barras Horizontal - Solo Desktop */}
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={chartHeightDesktop}>
                    <BarChart
                        data={displayDataDesktop}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis
                            dataKey="zone"
                            type="category"
                            width={120}
                            stroke="#9ca3af"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34, 197, 94, 0.1)" }} />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                            {displayDataDesktop.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Torta Top 3 - Solo Mobile */}
            <div className="md:hidden">
                {/* Referencias arriba */}
                <div className="space-y-2 mb-4">
                    {displayDataMobile.map((item, index) => {
                        const percentage = ((item.value / totalMobile) * 100).toFixed(0);
                        return (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: item.fill }}
                                    ></div>
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: item.fill }}>
                                    {percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Gráfico de torta sin labels */}
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={displayDataMobile}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {displayDataMobile.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Resumen de estadísticas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Con usuarios</div>
                    <div className="text-2xl font-bold text-green-500">
                        {data.filter((p) => p.count > 0).length}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Sin usuarios</div>
                    <div className="text-2xl font-bold text-gray-500">
                        {data.filter((p) => p.count === 0).length}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Total usuarios</div>
                    <div className="text-2xl font-bold text-blue-500">
                        {data.reduce((sum, p) => sum + p.count, 0)}
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-xs text-muted-foreground mb-1">Promedio</div>
                    <div className="text-2xl font-bold text-purple-500">
                        {(data.reduce((sum, p) => sum + p.count, 0) / data.filter((p) => p.count > 0).length).toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Leyenda de colores - Solo Desktop */}
            <div className="mt-6 hidden md:flex flex-wrap justify-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#d1d5db" }}></div>
                    <span className="text-muted-foreground">Sin usuarios</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#86efac" }}></div>
                    <span className="text-muted-foreground">1-2</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#4ade80" }}></div>
                    <span className="text-muted-foreground">3-5</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></div>
                    <span className="text-muted-foreground">6-10</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#15803d" }}></div>
                    <span className="text-muted-foreground">11+</span>
                </div>
            </div>
        </div>
    );
}