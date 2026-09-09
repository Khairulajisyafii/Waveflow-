import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";
import { verifySession } from "../../../src/utils/auth";

export async function GET(request: Request) {
  try {
    const userId = await verifySession(request);

    if (!userId) {
      return NextResponse.json({ error: "Belum login atau session tidak valid" }, { status: 401 });
    }

    const user = await db.orm.public.User.where({ id: userId }).first();

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
