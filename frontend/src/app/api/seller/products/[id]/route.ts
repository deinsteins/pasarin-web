import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper function to resolve seller ID from token
async function resolveSellerId(token: string, backendUrl: string): Promise<number | null> {
  try {
    // 1. Fetch current user info
    const meRes = await fetch(`${backendUrl}/api/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return null;
    const meData = await meRes.json();
    const userId = meData.id;

    // 2. Fetch all sellers
    const sellersRes = await fetch(`${backendUrl}/api/sellers`);
    if (!sellersRes.ok) return null;
    const sellers = await sellersRes.json();

    // 3. Find matching seller
    const matchedSeller = sellers.find((s: any) => s.user_id === userId);
    return matchedSeller ? matchedSeller.id : null;
  } catch (error) {
    console.error("resolveSellerId error:", error);
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";

    // 1. Resolve seller ID
    const sellerId = await resolveSellerId(token, backendUrl);
    if (!sellerId) {
      return NextResponse.json({ error: "Access denied. Seller profile required." }, { status: 403 });
    }

    // 2. Fetch the product to check ownership
    const productRes = await fetch(`${backendUrl}/api/products/${id}`);
    if (!productRes.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: productRes.status });
    }
    const productData = await productRes.json();

    // 3. Verify ownership
    if (!productData.seller || productData.seller.id !== sellerId) {
      return NextResponse.json({ error: "Access denied. You do not own this product." }, { status: 403 });
    }

    // 4. Update the product
    const body = await request.json();
    const response = await fetch(`${backendUrl}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to update product" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Seller Products PUT BFF Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 550 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";

    // 1. Resolve seller ID
    const sellerId = await resolveSellerId(token, backendUrl);
    if (!sellerId) {
      return NextResponse.json({ error: "Access denied. Seller profile required." }, { status: 403 });
    }

    // 2. Fetch the product to check ownership
    const productRes = await fetch(`${backendUrl}/api/products/${id}`);
    if (!productRes.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: productRes.status });
    }
    const productData = await productRes.json();

    // 3. Verify ownership
    if (!productData.seller || productData.seller.id !== sellerId) {
      return NextResponse.json({ error: "Access denied. You do not own this product." }, { status: 403 });
    }

    // 4. Delete the product
    const response = await fetch(`${backendUrl}/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to delete product" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Seller Products DELETE BFF Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 550 });
  }
}
