import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { analytics } from "@/factory/analytics";
import { startTrial } from "@/factory/billing";
import { db, schema } from "./db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db(), {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const ent = await startTrial(user.id);
            void analytics.signedUp(user.id, { source: "signup" });
            if (ent?.trialEndsAt) {
              void analytics.trialStarted(user.id, ent.trialEndsAt);
            }
          } catch {
            // não bloqueia signup se trial falhar
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
