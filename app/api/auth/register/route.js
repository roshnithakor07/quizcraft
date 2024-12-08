import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim())     return NextResponse.json({ error: "Name is required."  }, { status: 400 });
    if (!email?.trim())    return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!password)         return NextResponse.json({ error: "Password is required." }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return NextResponse.json({ error: "Invalid email address." }, { status: 400 });

    const db       = await getDb();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (existing)  return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    await db.collection("users").insertOne({
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}