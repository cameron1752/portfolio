
import { Population } from './population.js';

const target = "meats and cheeses, always pleases";
const populationSize = 200;

export function doAi(){
    let start = Date.now();

    let population = new Population(target, populationSize);

    while (!population.found) {
    population.nextGeneration();
    console.log(`Gen ${population.generation}: ${population.best} (${population.bestFitness.toFixed(3)})`);
    }

    console.log();
    console.log("Population: " + populationSize);
    console.log("Took: " + population.generation + " generations");
    console.log("Average fitness: " + population.averageFitness);
    console.log("Elapsed Time: " + (Date.now() - start)/1000 + " s");

}

