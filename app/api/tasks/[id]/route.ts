import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";
import { verifySession } from "../../../../src/utils/auth";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await db.orm.public.Task.where({ id: taskId }).first();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify access to project
    const membership = await db.orm.public.ProjectMember.where({ userId, projectId: task.projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not authorized for this project" }, { status: 403 });
    }

    const updates = await request.json();
    
    // In basic Prisma Next without explicit update(), we can mutate and maybe it updates?
    // Oh wait, `db.orm.public.Task.where({ id: taskId }).update(updates)` ?
    // The previously logged methods were: `update`, `updateAll`. Let's use `update()`.
    // Wait, the properties returned from Object.keys were: `where`, `all`, `first`, `update`, `delete`, etc.
    // Let's use `db.orm.public.Task.where({ id: taskId }).update(updates)`.
    
    // We only allow updating specific fields
    const allowedFields = ["title", "description", "priority", "status", "assigneeId", "dueDate"];
    const safeUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    await db.orm.public.Task.where({ id: taskId }).update(safeUpdates);

    const updatedTask = await db.orm.public.Task.where({ id: taskId }).first();
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Failed to update task:", error);
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

    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await db.orm.public.Task.where({ id: taskId }).first();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const membership = await db.orm.public.ProjectMember.where({ userId, projectId: task.projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not authorized for this project" }, { status: 403 });
    }

    await db.orm.public.Task.where({ id: taskId }).delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
