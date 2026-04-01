import { headers } from "next/headers";
import { cache } from "react";
import { getAuth } from "./auth";

export const getServerSession = cache(async () => {
  const auth = await getAuth();
  return await auth.api.getSession({ headers: await headers() });
});
