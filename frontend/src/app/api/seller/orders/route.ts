import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const status = searchParams.get("status") || "";

    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    const url = `${backendUrl}/api/seller/orders?page=${page}&limit=${limit}&status=${status}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch orders" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Seller Orders GET BFF Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 550 });
  }
}
