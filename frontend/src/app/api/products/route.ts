import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    const { searchParams } = new URL(req.url);

    // Forward all query params to the backend
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const sort = searchParams.get("sort") || "latest";
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id") || "";

    const params = new URLSearchParams({ page, limit, sort });
    if (search) params.set("search", search);
    if (categoryId) params.set("category_id", categoryId);

    const response = await fetch(
      `${backendUrl}/api/products?${params.toString()}`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch products" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Products GET BFF Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
