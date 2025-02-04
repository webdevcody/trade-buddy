import {
  ActivitySquare,
  Utensils,
  Dumbbell,
  Moon,
  Smile,
  LineChart,
  Users,
} from "lucide-react";

export function SideNavigation() {
  return (
    <nav className="left-0 h-full w-64 bg-background border-r p-4">
      <div className="space-y-4">
        <a
          href="/dashboard"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <ActivitySquare className="w-5 h-5" />
          <span>Overview</span>
        </a>

        <a
          href="/dashboard/food"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <Utensils className="w-5 h-5" />
          <span>Food Tracking</span>
        </a>

        <a
          href="/dashboard/exercise"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <Dumbbell className="w-5 h-5" />
          <span>Exercise</span>
        </a>

        <a
          href="/dashboard/sleep"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <Moon className="w-5 h-5" />
          <span>Sleep</span>
        </a>

        <a
          href="/dashboard/mood"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <Smile className="w-5 h-5" />
          <span>Mood</span>
        </a>

        <a
          href="/dashboard/weight"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <LineChart className="w-5 h-5" />
          <span>Weight</span>
        </a>

        <a
          href="/dashboard/social"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
        >
          <Users className="w-5 h-5" />
          <span>Social</span>
        </a>
      </div>
    </nav>
  );
}
