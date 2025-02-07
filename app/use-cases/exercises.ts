import {
  createExercise,
  deleteExercise,
  getExercise,
  getExercises,
} from "../data-access/exercises";
import { Exercise, User, type ExerciseCreate } from "../db/schema";

type UseCaseContext = {
  userId: number;
};

export function createExerciseUseCase(
  context: UseCaseContext,
  exercise: ExerciseCreate
) {
  return createExercise({ ...exercise, userId: context.userId });
}

export function getExercisesUseCase() {
  return getExercises();
}

export async function deleteExerciseUseCase(
  authenticatedUserId: User["id"],
  exerciseId: Exercise["id"]
) {
  const exercise = await getExercise(exerciseId);

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  if (exercise.userId !== authenticatedUserId) {
    throw new Error("Unauthorized");
  }

  return deleteExercise(exerciseId);
}
