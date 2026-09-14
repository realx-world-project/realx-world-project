import { prisma } from "@/lib/prisma";

const DEFAULTS: Record<string, string> = {
  LISTING_FEE: "5000",
  ENQUIRY_FEE: "500",
  COMMISSION_RATE: "3",
  PAYMENTS_ENABLED: "false",
};

export async function getSetting(key: string): Promise<string> {
  try {
    const db: any = prisma;
    const setting = await db.platformSettings.findUnique({
      where: { key },
    });
    return setting?.value ?? DEFAULTS[key] ?? "";
  } catch {
    return DEFAULTS[key] ?? "";
  }
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  await Promise.all(keys.map(async (key) => {
    results[key] = await getSetting(key);
  }));
  return results;
}

export async function isPaymentsEnabled(): Promise<boolean> {
  const val = await getSetting("PAYMENTS_ENABLED");
  return val === "true";
}
