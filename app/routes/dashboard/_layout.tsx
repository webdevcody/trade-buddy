import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SideNavigation } from "~/components/SideNavigation";

export const Route = createFileRoute("/dashboard/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex">
      <SideNavigation />

      <div className="px-8">
        <Outlet />
      </div>
    </div>
  );
}
