import { NextRequest, NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { success: false, message: "Missing file URL" },
        { status: 400 }
      );
    }

    // ✅ Extract UploadThing file key from URL
    const fileKey = url.split("/").pop();

    if (!fileKey) {
      return NextResponse.json(
        { success: false, message: "Invalid file URL" },
        { status: 400 }
      );
    }

    await utapi.deleteFiles(fileKey);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete upload error:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
  }
      
