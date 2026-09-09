import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { verifySession } from "../../../../src/utils/auth";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = parseInt(params.id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Verify access
    const membership = await db.orm.public.ProjectMember.where({ userId, projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const project = await db.orm.public.Project.where({ id: projectId }).first();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
