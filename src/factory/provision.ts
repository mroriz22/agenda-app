import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db, schema } from "@/lib/db";
import { analytics } from "./analytics";
import { activatePaid, startTrial } from "./billing";

export type ProvisionInput = {
  email: string;
  name: string;
  quackEventId: string;
  quackEventType: string;
  quackOrderId?: string;
  quackProductId?: string;
  totalCents?: number;
  periodEnd?: Date | null;
  plan?: string;
};

/**
 * Idempotente por billing_event.id (= envelope.id da Quack).
 * Cria user se preciso → ativa paid → analytics.
 */
export async function provisionFromQuack(input: ProvisionInput): Promise<{
  userId: string;
  already: boolean;
  createdUser: boolean;
}> {
  const d = db();

  const existingEvent = await d.query.billingEvent.findFirst({
    where: eq(schema.billingEvent.id, input.quackEventId),
  });
  if (existingEvent) {
    return {
      userId: existingEvent.userId ?? "",
      already: true,
      createdUser: false,
    };
  }

  let createdUser = false;
  const existingUser = await d.query.user.findFirst({
    where: eq(schema.user.email, input.email),
  });

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
  } else {
    userId = randomBytes(16).toString("hex");
    const now = new Date();
    await d.insert(schema.user).values({
      id: userId,
      name: input.name,
      email: input.email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    const passwordHash = await hashPassword(randomBytes(24).toString("base64url"));
    await d.insert(schema.account).values({
      id: randomBytes(16).toString("hex"),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    createdUser = true;
    // trial residual não importa — vai virar active logo abaixo
    await startTrial(userId).catch(() => null);
    void analytics.signedUp(userId, { source: "quack_webhook" });
  }

  await activatePaid({
    userId,
    plan: input.plan ?? "pro",
    quackEventId: input.quackEventId,
    quackOrderId: input.quackOrderId,
    quackProductId: input.quackProductId,
    totalCents: input.totalCents,
    periodEnd: input.periodEnd,
  });

  await d.insert(schema.billingEvent).values({
    id: input.quackEventId,
    userId,
    type: input.quackEventType,
    payload: {
      orderId: input.quackOrderId,
      productId: input.quackProductId,
      totalCents: input.totalCents,
    },
  });

  void analytics.purchase(userId, {
    orderId: input.quackOrderId,
    productId: input.quackProductId,
    totalCents: input.totalCents,
    eventType: input.quackEventType,
  });

  return { userId, already: false, createdUser };
}
