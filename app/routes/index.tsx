import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4">
        A Healthy Life is a Better Life
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Sign up for a community working towards living healthier lives.
      </p>

      <a href="/api/login/google">
        <Button>Get Started Now</Button>
      </a>
    </div>
  );
}
