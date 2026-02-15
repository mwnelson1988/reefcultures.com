// app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const name = body?.name;
    const email = body?.email;
    const password = body?.password;
    const company = body?.company;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();
    const normalizedCompany =
      company && String(company).trim().length > 0 ? String(company).trim() : null;

    if (!normalizedName) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(String(password), 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        company: normalizedCompany, // optional
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "User created successfully.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
