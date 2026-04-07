import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/get-session";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";

const MAX_HISTORY_ENTRIES = 50;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const path = typeof body?.path === "string" ? body.path.trim() : "";
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 140) : undefined;

    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ success: false, message: "Invalid path" }, { status: 400 });
    }

    await connectToDatabase();

    await User.findByIdAndUpdate(
      session.user.id,
      [
        {
          $set: {
            navigationHistory: {
              $slice: [
                {
                  $concatArrays: [
                    [
                      {
                        path,
                        title,
                        visitedAt: "$$NOW",
                      },
                    ],
                    {
                      $filter: {
                        input: { $ifNull: ["$navigationHistory", []] },
                        as: "item",
                        cond: { $ne: ["$$item.path", path] },
                      },
                    },
                  ],
                },
                MAX_HISTORY_ENTRIES,
              ],
            },
          },
        },
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save navigation history", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
