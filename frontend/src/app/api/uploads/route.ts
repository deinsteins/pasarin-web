import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
    
    // Parse form data from client request
    const formData = await request.formData();
    
    // Build form data for backend
    const backendFormData = new FormData();
    
    const file = formData.get("file");
    if (file) {
      backendFormData.append("file", file);
    }
    
    const folder = formData.get("folder");
    if (folder) {
      backendFormData.append("folder", folder);
    }

    const response = await fetch(`${backendUrl}/api/uploads`, {
      method: "POST",
      body: backendFormData,
      // Let fetch set Content-Type header with the boundary
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to upload file to backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload POST BFF Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
