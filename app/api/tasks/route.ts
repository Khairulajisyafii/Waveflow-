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
    const { title, description, projectId, priority, status, assigneeId, dueDate } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and projectId are required" }, { status: 400 });
    }

    const membership = await db.orm.public.ProjectMember.where({ userId, projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not authorized for this project" }, { status: 403 });
    }

    const task = await db.orm.public.Task.create({
      title,
      description: description || null,
      projectId,
      creatorId: userId,
      priority: priority || "MEDIUM",
      status: status || "TODO",
      assigneeId: assigneeId || null,
      dueDate: dueDate || null
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await verifySession(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectIdStr = searchParams.get("projectId");
    
    if (!projectIdStr) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const projectId = parseInt(projectIdStr, 10);

    const membership = await db.orm.public.ProjectMember.where({ userId, projectId }).first();
    if (!membership) {
      return NextResponse.json({ error: "Not authorized for this project" }, { status: 403 });
    }

    const whereClause: any = { projectId };
    
    const status = searchParams.get("status");
    if (status) whereClause.status = status;
    
    const priority = searchParams.get("priority");
    if (priority) whereClause.priority = priority;

    const assigneeId = searchParams.get("assigneeId");
    if (assigneeId) whereClause.assigneeId = parseInt(assigneeId, 10);

    const tasks = await db.orm.public.Task.where(whereClause).all();

    const search = searchParams.get("search");
    if (search) {
      const lowerSearch = search.toLowerCase();
      const filtered = tasks.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) || 
        (t.description && t.description.toLowerCase().includes(lowerSearch))
      );
      return NextResponse.json(filtered, { status: 200 });
    }

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
