import { createServerFn } from "@tanstack/start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { getExercisesUseCase } from "~/use-cases/exercises";

const getExercisesFn = createServerFn().handler(async () => {
	const exercises = await getExercisesUseCase();
	return exercises;
});

export const Route = createFileRoute("/dashboard/exercise/")({
	component: RouteComponent,
	loader: async () => {
		const exercises = await getExercisesFn();
		return { exercises };
	},
});

function RouteComponent() {
	const { exercises } = Route.useLoaderData();

	return (
		<div className='flex-grow'>
			<div className='flex justify-between'>
				<h1 className='text-2xl font-bold'>Your Exercise History</h1>
				<Link to='/dashboard/exercise/add'>
					<Button>Log Exercise</Button>
				</Link>
			</div>

			<div className='flex flex-col gap-4'>
				{exercises.map((exercise) => (
					<div key={exercise.id}>
						<h2>{exercise.exercise}</h2>
						<p>{exercise.weight}</p>
						<p>{exercise.reps}</p>
						<p>{exercise.sets}</p>
					</div>
				))}
			</div>
		</div>
	);
}
