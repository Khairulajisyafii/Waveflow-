import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { verifySession } from "../../../../src/utils/auth";
import crypto from "crypto";

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

    let project = await db.orm.public.Project.where({ id: projectId }).first();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Backfill webhookToken for old projects created before the token feature
    if (!project.webhookToken) {
      const newToken = crypto.randomUUID();
      const updated = await db.orm.public.Project.where({ id: projectId }).update({ webhookToken: newToken });
      if (updated) {
        project = updated;
      }
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
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

    const membership = await db.orm.public.ProjectMember.where({ userId, projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.githubRepo !== undefined) updateData.githubRepo = body.githubRepo;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    const updated = await db.orm.public.Project.where({ id: projectId }).update(updateData);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
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

    // Verify access - check if owner
    const project = await db.orm.public.Project.where({ id: projectId }).first();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== userId) {
      return NextResponse.json({ error: "Only the project owner can delete it" }, { status: 403 });
    }

    // Prisma Composer relations - we must delete related data first
    await db.orm.public.Task.where({ projectId }).delete();
    await db.orm.public.ProjectMember.where({ projectId }).delete();
    await db.orm.public.Project.where({ id: projectId }).delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
