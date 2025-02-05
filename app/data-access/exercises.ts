import { ExerciseCreate, exercises } from "~/db/schema";
import { database } from "../db";

export function createExercise(exercise: ExerciseCreate) {
  return database.insert(exercises).values(exercise);
}

export function getExercises() {
  return database.query.exercises.findMany();
}
