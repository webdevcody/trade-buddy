import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { getCurrentUser } from "~/utils/session";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";

export const getUserInfoFn = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  return { user };
});

export function Header() {
  const userInfo = useSuspenseQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfoFn(),
  });

  console.log(userInfo.data.user);

  return (
    <div className="container mx-auto flex justify-between items-center text-lg py-4">
      <div className="flex gap-12">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>
        <Link
          to="/about"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          About
        </Link>
      </div>

      <div className="flex gap-4">
        {userInfo.data.user ? (
          <a href="/api/logout">
            <Button>Sign Out</Button>
          </a>
        ) : (
          <a href="/api/login/google">
            <Button>Sign In</Button>
          </a>
        )}

        <ModeToggle />
      </div>
    </div>
  );
}
