import random

# --- Parameters ---
POPULATION_SIZE = 10
GENOME_LENGTH = 10
GENERATIONS = 100
MUTATION_RATE = 0.1
X_MIN = -5
X_MAX = 5

# --- Helper Functions ---

def decode_chromosome(chromosome):
    """Decodes a 10-bit binary chromosome to a real value between -5 and 5."""
    # Convert binary list to integer
    integer_value = int("".join(map(str, chromosome)), 2)
    # Map integer (0 to 1023) to range [-5, 5]
    max_int = (2**GENOME_LENGTH) - 1
    decoded_value = X_MIN + (integer_value / max_int) * (X_MAX - X_MIN)
    return decoded_value

def fitness_function(x):
    """Calculates fitness f(x) = 1 - x^2. Ensures non-negative fitness."""
    value = 1 - x**2
    # If value is negative, return 0 (or a small number) because roulette wheel needs positive values
    return max(0, value)

def create_individual():
    """Creates a random 10-bit chromosome."""
    return [random.randint(0, 1) for _ in range(GENOME_LENGTH)]

def roulette_wheel_selection(population, fitnesses):
    """Selects a parent using Roulette Wheel Selection."""
    total_fitness = sum(fitnesses)
    if total_fitness == 0:
        return random.choice(population)
    
    pick = random.uniform(0, total_fitness)
    current = 0
    for individual, fitness in zip(population, fitnesses):
        current += fitness
        if current > pick:
            return individual
    return population[-1]

def crossover(parent1, parent2):
    """Single-point crossover."""
    point = random.randint(1, GENOME_LENGTH - 1)
    child1 = parent1[:point] + parent2[point:]
    child2 = parent2[:point] + parent1[point:]
    return child1, child2

def mutate(individual):
    """Single bit-flip mutation."""
    if random.random() < MUTATION_RATE:
        point = random.randint(0, GENOME_LENGTH - 1)
        individual[point] = 1 - individual[point] # Flip 0 to 1 or 1 to 0
    return individual

# --- Main Algorithm ---

def run_genetic_algorithm():
    # Silent execution, only print JSON at the end
    
    # 1. Initialization
    population = [create_individual() for _ in range(POPULATION_SIZE)]
    
    history = []
    
    for generation in range(GENERATIONS):
        # 2. Evaluation
        decoded_values = [decode_chromosome(ind) for ind in population]
        fitnesses = [fitness_function(val) for val in decoded_values]
        
        # Track best solution
        best_fitness = max(fitnesses)
        best_index = fitnesses.index(best_fitness)
        best_x = decoded_values[best_index]
        
        # Store history for visualization
        history.append({
            "generation": generation,
            "best_fitness": best_fitness,
            "best_x": best_x
        })
        
        # 3. Selection & Reproduction
        new_population = []
        while len(new_population) < POPULATION_SIZE:
            parent1 = roulette_wheel_selection(population, fitnesses)
            parent2 = roulette_wheel_selection(population, fitnesses)
            
            child1, child2 = crossover(parent1, parent2)
            
            new_population.append(mutate(child1))
            if len(new_population) < POPULATION_SIZE:
                new_population.append(mutate(child2))
        
        population = new_population

    # Final Result
    final_decoded = [decode_chromosome(ind) for ind in population]
    final_fitnesses = [fitness_function(val) for val in final_decoded]
    best_fitness = max(final_fitnesses)
    best_ind_index = final_fitnesses.index(best_fitness)
    
    result = {
        "best_x": final_decoded[best_ind_index],
        "best_fitness": best_fitness,
        "history": history
    }
    
    import json
    print(json.dumps(result))

if __name__ == "__main__":
    run_genetic_algorithm()
