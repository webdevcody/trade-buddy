import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/food")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/dashboard/food"!</div>;
}
