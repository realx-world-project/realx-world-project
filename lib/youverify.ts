const BASE_URL = "https://api.youverify.co/v2/api/identity/ng";

const ENDPOINTS: Record<string, string> = {
  NIN: `${BASE_URL}/nin`,
  BVN: `${BASE_URL}/bvn`,
  DRIVERS_LICENSE: `${BASE_URL}/drivers-license`,
  PASSPORT: `${BASE_URL}/passport`,
};

export interface YouverifyResult {
  success: boolean;
  reference?: string;
  failureReason?: string;
  raw?: any;
}

export async function verifyIdentity(params: {
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}): Promise<YouverifyResult> {
  const endpoint = ENDPOINTS[params.idType];
  if (!endpoint) {
    return { success: false, failureReason: "Unsupported ID type" };
  }
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: process.env.YOUVERIFY_API_KEY ?? "",
      },
      body: JSON.stringify({
        id: params.idNumber,
        firstName: params.firstName,
        lastName: params.lastName,
        dateOfBirth: params.dateOfBirth,
        isSubjectConsent: true,
      }),
    });
    const data = await res.json();
    // Youverify returns statusCode 200 and success: true on match
    if (data?.statusCode === 200 && data?.success === true) {
      return {
        success: true,
        reference: data?.data?.id ?? data?.requestId,
        raw: data,
      };
    }
    return {
      success: false,
      failureReason: data?.message ?? "Verification failed",
      raw: data,
    };
  } catch (err: any) {
    return { success: false, failureReason: err?.message ?? "Network error" };
  }
}
