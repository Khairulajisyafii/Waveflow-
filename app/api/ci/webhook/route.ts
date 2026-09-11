import { NextResponse } from "next/server";
import { db } from "../../../../src/prisma/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, githubRepo, ciStatus } = body;

    if (!secret || !ciStatus) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the project that matches this unique webhook token
    const project = await db.orm.public.Project.where({ webhookToken: secret }).first();

    if (!project) {
      return NextResponse.json({ error: "Unauthorized or Invalid Webhook Token" }, { status: 401 });
    }

    // Map GitHub's lowercase status to Waveflow's expected uppercase format
    let mappedStatus = ciStatus.toUpperCase();
    if (mappedStatus === "FAILURE") mappedStatus = "FAILED";
    if (mappedStatus === "CANCELLED") mappedStatus = "FAILED";

    // Update the CI status for this specific project
    await db.orm.public.Project.where({ id: project.id }).update({ ciStatus: mappedStatus });

    // Optionally update the stored githubRepo if it's different and provided
    if (githubRepo && project.githubRepo !== githubRepo) {
      await db.orm.public.Project.where({ id: project.id }).update({ githubRepo });
    }

    return NextResponse.json({ message: "CI status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to process CI webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
