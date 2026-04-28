import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const TIMEOUT_MS = 1500;

function withTimeout<T>(promise: Promise<T>): Promise<T | null> {
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), TIMEOUT_MS)
  );
  return Promise.race([promise, timeout]);
}

async function checkDb(): Promise<"ok" | "error"> {
  try {
    const result = await withTimeout(prisma.$queryRaw`SELECT 1`);
    return result !== null ? "ok" : "error";
  } catch {
    return "error";
  }
}

async function checkRedis(): Promise<"ok" | "error"> {
  try {
    const result = await withTimeout(redis.ping());
    return result === "PONG" ? "ok" : "error";
  } catch {
    return "error";
  }
}

export async function GET() {
  const [db, redisStatus] = await Promise.all([checkDb(), checkRedis()]);

  const bothFailed = db === "error" && redisStatus === "error";
  const anyFailed = db === "error" || redisStatus === "error";

  const status = bothFailed ? "down" : anyFailed ? "degraded" : "ok";

  return NextResponse.json(
    { status, db, redis: redisStatus, timestamp: new Date().toISOString() },
    { status: bothFailed ? 503 : anyFailed ? 207 : 200 }
  );
}
