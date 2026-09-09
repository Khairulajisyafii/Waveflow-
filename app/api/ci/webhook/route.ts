import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.CI_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("CI_WEBHOOK_SECRET is not configured in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, repoUrl, status } = body;

    const allowedStatuses = ["QUEUED", "RUNNING", "SUCCESS", "FAILED"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let targetProject = null;

    if (projectId) {
      targetProject = await db.orm.public.Project.where({ id: Number(projectId) }).first();
    } else if (repoUrl) {
      targetProject = await db.orm.public.Project.where({ githubRepo: repoUrl }).first();
    }

    if (!targetProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedProject = await db.orm.public.Project.where({ id: targetProject.id }).update({
      ciStatus: status
    });

    return NextResponse.json({ success: true, project: updatedProject }, { status: 200 });
  } catch (error) {
    console.error("Failed to process CI webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
