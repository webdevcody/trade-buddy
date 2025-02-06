import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Dumbbell, Home, Utensils } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function SideNavigation() {
  return (
    <div className="h-screen w-64 border-r p-4">
      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent"
          activeProps={{
            className: 'flex items-center gap-2 rounded-lg px-3 py-2 bg-accent',
          }}
          activeOptions={{ exact: true }}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
        <Link
          to="/dashboard/food"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent"
          activeProps={{
            className: 'flex items-center gap-2 rounded-lg px-3 py-2 bg-accent',
          }}
        >
          <Utensils className="h-4 w-4" />
          <span>Food</span>
        </Link>
        <Link
          to="/dashboard/exercise"
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent"
          activeProps={{
            className: 'flex items-center gap-2 rounded-lg px-3 py-2 bg-accent',
          }}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Exercise</span>
        </Link>
      </nav>
    </div>
  )
}

function RouteComponent() {
  return (
    <div className="flex gap-8">
      <SideNavigation />
      <Outlet />
    </div>
  )
}
