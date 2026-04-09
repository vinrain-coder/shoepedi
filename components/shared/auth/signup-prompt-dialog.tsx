"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { toSignUpPath } from "@/lib/redirects";
import { Sparkles } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const KNOWN_USER_KEY = "auth:known-user";
const PROMPT_DISMISSED_KEY = "auth:signup-prompt:dismissed";
const PROMPT_LAST_SHOWN_KEY = "auth:signup-prompt:last-shown";
const PROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const EXCLUDED_PATH_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
  "/checkout",
  "/account",
  "/admin",
  "/pricing",
];

export default function SignUpPromptDialog() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isPending || session?.user?.id) {
      setOpen(false);
      return;
    }

    if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    const knownUser = localStorage.getItem(KNOWN_USER_KEY) === "1";
    const dismissed = localStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
    const lastShown = Number(localStorage.getItem(PROMPT_LAST_SHOWN_KEY) || "0");
    const withinCooldown = Date.now() - lastShown < PROMPT_COOLDOWN_MS;

    if (knownUser || dismissed || withinCooldown) {
      return;
    }

    const timer = window.setTimeout(() => {
      localStorage.setItem(PROMPT_LAST_SHOWN_KEY, String(Date.now()));
      setOpen(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [isPending, pathname, session?.user?.id]);

  const handleContinue = () => {
    setOpen(false);
    router.push(toSignUpPath(currentPath));
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl border-primary/20 bg-gradient-to-b from-background to-muted/30">
        <DialogHeader>
          <div className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle className="text-center">Unlock a better shopping experience</DialogTitle>
          <DialogDescription className="text-center text-sm leading-6">
            Create a free account to save your wishlist, track orders faster, checkout more smoothly, and get up to 20% off your first purchase.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-center">
          <Button variant="outline" onClick={handleDismiss}>
            Maybe later
          </Button>
          <Button onClick={handleContinue}>Sign up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
