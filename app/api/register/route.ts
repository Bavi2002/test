import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import * as z from "zod";
import { put, del } from "@vercel/blob";
import { getUserSession } from "@/lib/session";
import { Session } from "inspector/promises";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  company: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const image = formData.get("image") as File | null;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let profileImageUrl: string | null = null;
    if (image) {
      const fileExtension = image.name.split(".").pop();
      const fileName = `profiles/${email}-${Date.now()}.${fileExtension}`;
      const blob = await put(fileName, image, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      profileImageUrl = blob.url;
    }

    const user = await prisma.user.create({
      data: {
        userId: crypto.randomUUID(),
        name,
        company,
        email,
        password: hashedPassword,
        image: profileImageUrl ?? "",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
          company: user.company,
          profileImage: user.image,
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
  }
}

export async function GET(request: Request) {
  try {


    const session = await getUserSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const users = await prisma.user.findMany({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        image: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getUserSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const company = formData.get("company") as string;
    const image = formData.get("image") as File | null;

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id },
      },
    });
    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 409 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    let profileImageUrl: string | null = currentUser?.image || null;

    if (image) {
      if (currentUser?.image) {
        try {
          await del(currentUser.image, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
        } catch (error) {
          console.error("Error deleting previous image:", error);
        }
      }

      const fileExtension = image.name.split(".").pop();
      const fileName = `profiles/${email}-${Date.now()}.${fileExtension}`;
      const blob = await put(fileName, image, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      profileImageUrl = blob.url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        company: company || null,
        image: profileImageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        image: true,
      },
    });

    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}