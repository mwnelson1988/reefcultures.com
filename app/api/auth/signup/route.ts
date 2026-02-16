// app/api/auth/signup/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, password } = body;

    // Basic validation (company is optional)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(String(password), 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        company: company ? String(company).trim() : null, // ✅ optional
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully.",
        user: {
          id: user.id,
          name: user.name,
          company: user.company,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
