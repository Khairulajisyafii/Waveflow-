import { NextResponse } from "next/server";
import { db } from "../../../src/prisma/db";
import { verifySession } from "../../../src/utils/auth";
import bcrypt from "bcryptjs";

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
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await verifySession(request);

    if (!userId) {
      return NextResponse.json({ error: "Belum login atau session tidak valid" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currentPassword, newPassword, avatarUrl } = body;

    const user = await db.orm.public.User.where({ id: userId }).first();

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const updateData: any = {};

    if (name !== undefined && name.trim() !== "") {
      updateData.name = name.trim();
    }
    
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl.trim() === "" ? null : avatarUrl.trim();
    }

    if (currentPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 },
        );
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diperbarui" }, { status: 400 });
    }

    const updatedUser = await db.orm.public.User.where({ id: userId }).update(updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: "Gagal memperbarui, user tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
      },
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
