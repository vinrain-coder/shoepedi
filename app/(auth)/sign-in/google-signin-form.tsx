"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Google from "@/public/icons/google.svg";
import SubmitButton from "@/components/shared/submit-button";

export function GoogleSignInForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google");
    setLoading(false);
  };

  return (
    <SubmitButton
      type="button"
      isLoading={loading}
      onClick={handleGoogleSignIn}
      className="w-full flex items-center gap-2"
      variant="outline"
    >
      {loading ? (
        <Loader2 className="animate-spin w-5 h-5" />
      ) : (
        <Image src={Google} alt="GoogleLogo" width={18} height={18} priority />
      )}
      {loading ? "Redirecting to Google..." : "Sign in with Google"}
    </SubmitButton>
  );
}
