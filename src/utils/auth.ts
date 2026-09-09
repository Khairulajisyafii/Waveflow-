import { jwtVerify } from "jose";

export async function verifySession(request: Request): Promise<number | null> {
  try {
    const session = request.headers
      .get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!session) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(session, secret);
    
    if (payload && payload.userId) {
      return Number(payload.userId);
    }
    
    return null;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
