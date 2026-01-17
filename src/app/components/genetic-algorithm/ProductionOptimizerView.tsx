"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { Play, RotateCcw, Zap, Activity, Thermometer, Gauge, Clock } from "lucide-react";
import { ProductionOptimizer, OptimizationResult } from "@/lib/production-optimizer";

const ProductionOptimizerView: React.FC = () => {
    const [optimizer] = useState(() => new ProductionOptimizer(50, 0.1, 2));
    const [generation, setGeneration] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [bestGenes, setBestGenes] = useState<number[]>([0, 0, 0, 0]);
    const [bestFitness, setBestFitness] = useState(0);

    const animationRef = useRef<number | null>(null);

    const runStep = () => {
        const result = optimizer.evolve();
        setGeneration(g => {
            const newGen = g + 1;
            result.generation = newGen;
            return newGen;
        });

        setBestGenes(result.bestIndividual.genes);
        setBestFitness(result.bestIndividual.fitness);

        setHistory(prev => {
            const newHistory = [...prev, {
                gen: result.generation,
                best: result.bestFitness,
                avg: result.averageFitness
            }];
            // Keep last 50 points for better visualization if it runs long
            if (newHistory.length > 100) return newHistory.slice(newHistory.length - 100);
            return newHistory;
        });

        animationRef.current = requestAnimationFrame(runStep);
    };

    const toggleSimulation = () => {
        if (isRunning) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setIsRunning(false);
        } else {
            setIsRunning(true);
            runStep();
        }
    };

    const resetSimulation = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setIsRunning(false);
        optimizer.initialize();
        setGeneration(0);
        setHistory([]);
        setBestGenes([0, 0, 0, 0]);
        setBestFitness(0);
    };

    // Initialize on mount
    useEffect(() => {
        optimizer.initialize();
        const initialBest = optimizer.getBest();
        setBestGenes(initialBest.genes);
        setBestFitness(initialBest.fitness);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [optimizer]);

    // Parameter formatters
    const formatSpeed = (val: number) => `${Math.round(val)} RPM`;
    const formatTemp = (val: number) => `${Math.round(val)} °C`;
    const formatPressure = (val: number) => `${Math.round(val)} Bar`;
    const formatMaintenance = (val: number) => `${Math.round(val)} Hours`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Controls */}
            <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        <Zap className="text-yellow-400" fill="currentColor" />
                        Production Efficiency Optimizer
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl">
                        Uses a Genetic Algorithm to find the optimal combination of Machine Speed, Temperature, Pressure, and Maintenance Interval to maximize production efficiency while minimizing risks.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={toggleSimulation}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${isRunning
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <span className="relative flex h-3 w-3 mr-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Stop Optimization
                            </>
                        ) : (
                            <>
                                <Play size={18} fill="currentColor" />
                                Start Optimization
                            </>
                        )}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-slate-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10"
                    >
                        <RotateCcw size={18} />
                        Reset
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Stats / Parameters */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Current Best Score */}
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Current Efficiency</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tight">
                                {bestFitness.toFixed(1)}%
                            </span>
                            <span className="text-sm text-emerald-400 font-medium">
                                Gen {generation}
                            </span>
                        </div>
                        <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                                style={{ width: `${bestFitness}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <ParameterCard
                            icon={<Activity size={20} className="text-blue-400" />}
                            label="Machine Speed"
                            value={formatSpeed(bestGenes[0])}
                            subtext="Target: ~2200-2400 RPM"
                            color="blue"
                        />
                        <ParameterCard
                            icon={<Thermometer size={20} className="text-orange-400" />}
                            label="Temperature"
                            value={formatTemp(bestGenes[1])}
                            subtext="Optimal: ~240 °C"
                            color="orange"
                        />
                        <ParameterCard
                            icon={<Gauge size={20} className="text-purple-400" />}
                            label="Pressure"
                            value={formatPressure(bestGenes[2])}
                            subtext="Optimal: ~80 Bar"
                            color="purple"
                        />
                        <ParameterCard
                            icon={<Clock size={20} className="text-pink-400" />}
                            label="Maint. Interval"
                            value={formatMaintenance(bestGenes[3])}
                            subtext="Optimal: ~48-72 Hours"
                            color="pink"
                        />
                    </div>
                </div>

                {/* Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Optimization Progress</h3>
                        <div className="flex gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                <span className="text-slate-300">Best Fitness</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500/50"></span>
                                <span className="text-slate-300">Avg Fitness</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                <XAxis
                                    dataKey="gen"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    label={{ value: 'Generation', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", color: "#f1f5f9", borderRadius: "12px" }}
                                    itemStyle={{ fontSize: '12px' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="best"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: "#10b981" }}
                                    animationDuration={300}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    strokeOpacity={0.5}
                                    dot={false}
                                    animationDuration={300}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ParameterCard = ({ icon, label, value, subtext, color }: any) => {
    const colorClasses: any = {
        blue: "bg-blue-500/10 border-blue-500/20",
        orange: "bg-orange-500/10 border-orange-500/20",
        purple: "bg-purple-500/10 border-purple-500/20",
        pink: "bg-pink-500/10 border-pink-500/20",
    };

    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${colorClasses[color]} transition-all hover:scale-[1.02]`}>
            <div className={`p-3 rounded-xl bg-slate-950/50`}>
                {icon}
            </div>
            <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{subtext}</div>
            </div>
        </div>
    );
};

export default ProductionOptimizerView;
