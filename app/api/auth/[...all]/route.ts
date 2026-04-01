import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

let handlersPromise: Promise<ReturnType<typeof toNextJsHandler>> | null = null;

async function getHandlers() {
  if (!handlersPromise) {
    handlersPromise = getAuth().then((auth) => toNextJsHandler(auth));
  }

  return handlersPromise;
}

export async function GET(request: Request) {
  const { GET } = await getHandlers();
  return GET(request);
}

export async function POST(request: Request) {
  const { POST } = await getHandlers();
  return POST(request);
}
