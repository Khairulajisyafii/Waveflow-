import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "../src/prisma/db";
import ClientNavbar from "./ClientNavbar";

export default async function Navbar() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  let user = null;

  if (session && process.env.SESSION_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      const { payload } = await jwtVerify(session, secret);
      if (payload && payload.userId) {
        // Fetch fresh user from DB to get avatarUrl
        const dbUser = await db.orm.public.User.where({ id: Number(payload.userId) }).first();
        if (dbUser) {
          user = { 
            name: dbUser.name, 
            email: dbUser.email,
            avatarUrl: dbUser.avatarUrl || null
          };
        }
      }
    } catch {
      // invalid session
    }
  }

  return <ClientNavbar user={user} />;
}
