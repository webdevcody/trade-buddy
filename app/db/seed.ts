import "dotenv/config";

import { database } from "./index";
import { accounts, profiles, users } from "~/db/schema";

async function main() {
  const [user] = await database
    .insert(users)
    .values({
      email: "testing@example.com",
      emailVerified: undefined,
    })
    .onConflictDoNothing()
    .returning();

  const [account] = await database
    .insert(accounts)
    .values({
      googleId: undefined,
      userId: user.id,
    })
    .onConflictDoNothing()
    .returning();

  const [profile] = await database
    .insert(profiles)
    .values({
      userId: user.id,
      displayName: "Test User",
    })
    .onConflictDoNothing()
    .returning();
}

main();
