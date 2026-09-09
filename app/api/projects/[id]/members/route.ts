import { NextResponse } from "next/server";
import { db } from "../../../../../src/prisma/db";
import { verifySession } from "../../../../../src/utils/auth";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = parseInt(params.id, 10);
    
    const membership = await db.orm.public.ProjectMember.where({ userId, projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not authorized for this project" }, { status: 403 });
    }

    const members = await db.orm.public.ProjectMember.where({ projectId }).all();
    
    // Fetch user details for each member
    const users = [];
    for (const member of members) {
      const user = await db.orm.public.User.where({ id: member.userId }).first();
      if (user) {
        users.push({ id: user.id, name: user.name, email: user.email, role: member.role });
      }
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch project members:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
