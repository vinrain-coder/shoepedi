import { NextResponse } from "next/server";
import { connection } from "@/lib/db/client";
import { getBlogBySlug } from "@/lib/actions/blog.actions";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  await connection();

  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  return NextResponse.json({
    likesCount: blog.likesCount || 0,
    comments: blog.comments || [],
  });
}
