import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Invalid credentials" },
        { status: response.status }
      );
    }

    const token = data.token;
    if (!token) {
      return NextResponse.json(
        { error: "Token not returned from authentication server" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ success: true, token });

    // Set the cookie securely
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login BFF Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
