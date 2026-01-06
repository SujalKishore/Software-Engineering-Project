export interface Individual {
    genes: number[]; // [Speed, Temperature, Pressure, MaintenanceInterval]
    fitness: number;
}

export interface OptimizationResult {
    generation: number;
    bestFitness: number;
    averageFitness: number;
    bestIndividual: Individual;
}

export class ProductionOptimizer {
    private populationSize: number;
    private mutationRate: number;
    private elitismCount: number;
    private population: Individual[];

    // Parameter ranges
    private readonly RANGES = [
        { min: 500, max: 3000 }, // Speed (RPM)
        { min: 100, max: 400 },  // Temperature (C)
        { min: 10, max: 150 },   // Pressure (Bar)
        { min: 4, max: 168 }     // Maintenance Interval (Hours)
    ];

    constructor(populationSize: number = 50, mutationRate: number = 0.05, elitismCount: number = 2) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.elitismCount = elitismCount;
        this.population = [];
    }

    // Initialize population with random values
    public initialize(): void {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const genes = this.RANGES.map(r => Math.random() * (r.max - r.min) + r.min);
            this.population.push({
                genes,
                fitness: this.calculateFitness(genes)
            });
        }
    }

    // Fitness Function: Simulates efficiency based on parameters
    private calculateFitness(genes: number[]): number {
        const [speed, temp, pressure, maintenance] = genes;

        // 1. Speed Score: Higher is better, but diminishing returns and higher risk
        // Optimal speed around 2200. Above that, quality drops.
        let speedScore = (speed / 3000) * 100;
        if (speed > 2400) speedScore -= (speed - 2400) * 0.2; // Penalty for too fast

        // 2. Temperature Score: Gaussian curve centered at 240C
        const optimalTemp = 240;
        const tempDiff = Math.abs(temp - optimalTemp);
        const tempScore = 100 * Math.exp(-(tempDiff * tempDiff) / (2 * 30 * 30)); // Sigma=30

        // 3. Pressure Score: Gaussian curve centered at 80 Bar
        const optimalPressure = 80;
        const pressureDiff = Math.abs(pressure - optimalPressure);
        const pressureScore = 100 * Math.exp(-(pressureDiff * pressureDiff) / (2 * 20 * 20)); // Sigma=20

        // 4. Maintenance Score: 
        // Too frequent (low interval) = high downtime penalty
        // Too rare (high interval) = breakdown risk penalty
        // Optimal around 48-72 hours
        let maintenanceScore = 0;
        if (maintenance < 24) {
            maintenanceScore = 20 + (maintenance / 24) * 30; // 20 to 50
        } else if (maintenance > 96) {
            maintenanceScore = 100 - ((maintenance - 96) * 0.8); // Penalty for risk
        } else {
            maintenanceScore = 80 + Math.random() * 20; // Good range
        }

        // Weighted Sum
        // Speed: 30%, Temp: 25%, Pressure: 25%, Maintenance: 20%
        let totalEfficiency = (speedScore * 0.3) + (tempScore * 0.25) + (pressureScore * 0.25) + (maintenanceScore * 0.2);

        // Add some noise to simulate real-world variance
        totalEfficiency += (Math.random() - 0.5) * 2;

        return Math.max(0, Math.min(100, totalEfficiency));
    }

    // Selection: Tournament Selection
    private selectParent(): Individual {
        const tournamentSize = 3;
        let best: Individual | null = null;
        for (let i = 0; i < tournamentSize; i++) {
            const ind = this.population[Math.floor(Math.random() * this.populationSize)];
            if (!best || ind.fitness > best.fitness) {
                best = ind;
            }
        }
        return best!;
    }

    // Crossover: Single Point Crossover with blending
    private crossover(parent1: Individual, parent2: Individual): Individual {
        const childGenes = [];
        for (let i = 0; i < parent1.genes.length; i++) {
            // Blend crossover
            const beta = Math.random();
            const gene = beta * parent1.genes[i] + (1 - beta) * parent2.genes[i];
            childGenes.push(gene);
        }
        return {
            genes: childGenes,
            fitness: 0 // Calculated later
        };
    }

    // Mutation: Gaussian perturbation
    private mutate(individual: Individual): void {
        for (let i = 0; i < individual.genes.length; i++) {
            if (Math.random() < this.mutationRate) {
                const range = this.RANGES[i];
                const span = range.max - range.min;
                const delta = (Math.random() - 0.5) * span * 0.1; // Shift by up to 5% of range
                individual.genes[i] = Math.max(range.min, Math.min(range.max, individual.genes[i] + delta));
            }
        }
    }

    // Evolve one generation
    public evolve(): OptimizationResult {
        // Sort by fitness descending
        this.population.sort((a, b) => b.fitness - a.fitness);

        const newPopulation: Individual[] = [];

        // Elitism
        for (let i = 0; i < this.elitismCount; i++) {
            newPopulation.push({ ...this.population[i] });
        }

        // Generate rest
        while (newPopulation.length < this.populationSize) {
            const p1 = this.selectParent();
            const p2 = this.selectParent();
            const child = this.crossover(p1, p2);
            this.mutate(child);
            child.fitness = this.calculateFitness(child.genes);
            newPopulation.push(child);
        }

        this.population = newPopulation;

        // Stats
        const best = this.population[0]; // Already sorted
        const avg = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.populationSize;

        return {
            generation: 0, // Set by caller
            bestFitness: best.fitness,
            averageFitness: avg,
            bestIndividual: { ...best }
        };
    }

    public getBest(): Individual {
        return this.population.reduce((prev, current) => (prev.fitness > current.fitness) ? prev : current);
    }
}
