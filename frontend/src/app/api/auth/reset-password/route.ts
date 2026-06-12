import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Gagal mengatur ulang kata sandi" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reset Password BFF Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
