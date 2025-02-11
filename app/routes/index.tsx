import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { getCurrentUser } from "~/utils/session";

const getUserInfoFn = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  return { user };
});

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const userInfo = useSuspenseQuery({
    queryKey: ["user-info"],
    queryFn: () => getUserInfoFn(),
  });

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">Learn and Teach from Anywhere</h1>
      <p className="text-xl text-gray-600 mb-8">
        Join our global community of students and teachers in an interactive
        online learning experience.
      </p>

      {userInfo.data.user ? (
        <Link to="/courses">
          <Button>View Courses</Button>
        </Link>
      ) : (
        <a href="/api/login/google">
          <Button>Get Started Now</Button>
        </a>
      )}
    </div>
  );
}
