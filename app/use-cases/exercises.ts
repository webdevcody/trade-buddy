import { createExercise, getExercises } from "../data-access/exercises";
import { type ExerciseCreate } from "../db/schema";

export function createExerciseUseCase(exercise: ExerciseCreate) {
  return createExercise({ ...exercise, userId: 1 });
}

export function getExercisesUseCase() {
  return getExercises();
}
