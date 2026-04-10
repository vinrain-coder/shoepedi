import { connection } from "next/server";
import { NextResponse } from "next/server";

import { getBlogBySlug } from "@/lib/actions/blog.actions";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return NextResponse.json({ message: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({
    likesCount: blog.likesCount || 0,
    comments: blog.comments || [],
  });
}
