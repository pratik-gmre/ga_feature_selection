

import numpy as np
from typing import List, Tuple, Dict, Any, Optional
import random


class GeneticAlgorithm:
   

    def __init__(
        self,
        n_features: int,
        population_size: int = 30,
        mutation_rate: float = 0.02,
        crossover_rate: float = 0.8,
        elitism_count: int = 2,
        alpha: float = 0.1,
        tournament_size: int = 3,
        min_features: int = 1,
    ):
        self.n_features = n_features
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.elitism_count = elitism_count
        self.alpha = alpha  
        self.tournament_size = tournament_size
        self.min_features = min_features

        self.population: List[np.ndarray] = []
        self.fitness_scores: List[float] = []
        self.generation: int = 0
        self.history: List[Dict[str, Any]] = []
        self.best_individual: Optional[np.ndarray] = None
        self.best_fitness: float = -np.inf

    def initialize_population(self) -> List[np.ndarray]:
       
        self.population = []
        for _ in range(self.population_size):

            individual = np.random.randint(0, 2, self.n_features)

            if individual.sum() < self.min_features:
                idx = np.random.choice(self.n_features, self.min_features, replace=False)
                individual[idx] = 1
            self.population.append(individual)

        self.generation = 0
        self.history = []
        self.best_individual = None
        self.best_fitness = -np.inf
        return self.population

    
    def compute_fitness(self, accuracy: float, n_selected: int) -> float:
       
        if n_selected == 0:
            return -1.0  
        penalty = self.alpha * (n_selected / self.n_features)
        return float(accuracy - penalty)

    def evaluate_population(self, evaluate_fn) -> List[float]:
      
        self.fitness_scores = []
        for individual in self.population:
            accuracy, n_selected = evaluate_fn(individual)
            fitness = self.compute_fitness(accuracy, n_selected)
            self.fitness_scores.append(fitness)


        best_idx = int(np.argmax(self.fitness_scores))
        if self.fitness_scores[best_idx] > self.best_fitness:
            self.best_fitness = self.fitness_scores[best_idx]
            self.best_individual = self.population[best_idx].copy()

        return self.fitness_scores

 
    def tournament_selection(self) -> np.ndarray:
       
        candidates = random.sample(range(self.population_size), self.tournament_size)
        winner = max(candidates, key=lambda i: self.fitness_scores[i])
        return self.population[winner].copy()

    def roulette_wheel_selection(self) -> np.ndarray:
      
        scores = np.array(self.fitness_scores)

        scores = scores - scores.min()
        total = scores.sum()
        if total == 0:
            return self.tournament_selection()
        probs = scores / total
        idx = np.random.choice(self.population_size, p=probs)
        return self.population[idx].copy()

   
    def single_point_crossover(
        self, parent1: np.ndarray, parent2: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:

        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()
        point = random.randint(1, self.n_features - 1)
        child1 = np.concatenate([parent1[:point], parent2[point:]])
        child2 = np.concatenate([parent2[:point], parent1[point:]])
        return child1, child2

    def two_point_crossover(
        self, parent1: np.ndarray, parent2: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:

        if random.random() > self.crossover_rate:
            return parent1.copy(), parent2.copy()
        pts = sorted(random.sample(range(1, self.n_features), 2))
        p, q = pts
        child1 = np.concatenate([parent1[:p], parent2[p:q], parent1[q:]])
        child2 = np.concatenate([parent2[:p], parent1[p:q], parent2[q:]])
        return child1, child2



    def bit_flip_mutation(self, individual: np.ndarray) -> np.ndarray:
       
        mutant = individual.copy()
        for i in range(self.n_features):
            if random.random() < self.mutation_rate:
                mutant[i] = 1 - mutant[i]

        if mutant.sum() < self.min_features:
            idx = np.random.choice(self.n_features, self.min_features, replace=False)
            mutant[idx] = 1
        return mutant



    def get_elites(self) -> List[np.ndarray]:

        sorted_idx = np.argsort(self.fitness_scores)[::-1]
        return [self.population[i].copy() for i in sorted_idx[: self.elitism_count]]



    def step(self, evaluate_fn, crossover_type: str = "two_point") -> Dict[str, Any]:
        
        self.evaluate_population(evaluate_fn)


        new_population = self.get_elites()


        crossover_fn = (
            self.two_point_crossover
            if crossover_type == "two_point"
            else self.single_point_crossover
        )

        while len(new_population) < self.population_size:
            parent1 = self.tournament_selection()
            parent2 = self.tournament_selection()
            child1, child2 = crossover_fn(parent1, parent2)
            child1 = self.bit_flip_mutation(child1)
            child2 = self.bit_flip_mutation(child2)
            new_population.append(child1)
            if len(new_population) < self.population_size:
                new_population.append(child2)

        self.population = new_population
        self.generation += 1


        best_idx = int(np.argmax(self.fitness_scores))
        best_ind = self.population[best_idx] if self.best_individual is None else self.best_individual
        gen_stats = {
            "generation": self.generation,
            "best_fitness": float(self.best_fitness),
            "avg_fitness": float(np.mean(self.fitness_scores)),
            "worst_fitness": float(np.min(self.fitness_scores)),
            "n_selected": int(best_ind.sum()),
            "selected_indices": best_ind.tolist() if self.best_individual is not None else [],
        }
        self.history.append(gen_stats)
        return gen_stats



    def get_state(self) -> Dict[str, Any]:

        return {
            "generation": self.generation,
            "best_fitness": float(self.best_fitness) if self.best_fitness != -np.inf else None,
            "best_individual": self.best_individual.tolist() if self.best_individual is not None else None,
            "n_selected": int(self.best_individual.sum()) if self.best_individual is not None else 0,
            "history": self.history,
            "population_size": self.population_size,
            "n_features": self.n_features,
        }
