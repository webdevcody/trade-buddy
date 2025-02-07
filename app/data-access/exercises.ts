import { Exercise, ExerciseCreate, exercises } from "~/db/schema";
import { database } from "../db";
import { eq } from "drizzle-orm";

export function createExercise(exercise: ExerciseCreate) {
  return database.insert(exercises).values(exercise);
}

export function getExercises() {
  return database.query.exercises.findMany();
}

export function deleteExercise(exerciseId: Exercise["id"]) {
  return database.delete(exercises).where(eq(exercises.id, exerciseId));
}

export function getExercise(exerciseId: Exercise["id"]) {
  return database.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
  });
}
