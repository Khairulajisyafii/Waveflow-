import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";
import { verifySession } from "../../../src/utils/auth";

export async function POST(request: Request) {
  try {
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await db.orm.public.Project.create({
      name,
      description: description || null,
      ownerId: userId,
      webhookToken: crypto.randomUUID()
    });

    await db.orm.public.ProjectMember.create({
      userId,
      projectId: project.id,
      role: "OWNER",
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db.orm.public.ProjectMember.where({ userId }).all();
    const projectIds = memberships.map(m => m.projectId);

    if (projectIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const projects = (await Promise.all(
      projectIds.map(id => db.orm.public.Project.where({ id }).first())
    )).filter(Boolean);

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
