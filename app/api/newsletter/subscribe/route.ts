import { NextResponse } from "next/server";

import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "@/lib/actions/newsletter.actions";

export async function POST(req: Request) {
  const body = await req.json();
  const response = await subscribeToNewsletter({
    email: body.email,
    source: body.source ?? "api",
    tags: body.tags ?? [],
    botField: body.botField,
  });

  return NextResponse.json(response, { status: response.success ? 200 : 400 });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const response = await unsubscribeFromNewsletter({
    email: body.email,
    token: body.token,
  });

  return NextResponse.json(response, { status: response.success ? 200 : 400 });
}
