"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

function AffiliateTrackerContent({ cookieExpiryDays = 30 }: { cookieExpiryDays?: number }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const affiliateCode = searchParams.get("ref") || searchParams.get("aff");

    if (affiliateCode) {
      // Store the affiliate code in a cookie
      Cookies.set("affiliate_code", affiliateCode, {
        expires: cookieExpiryDays,
        path: "/",
        sameSite: "lax",
      });
    }
  }, [searchParams, cookieExpiryDays]);

  return null;
}

export default function AffiliateTracker({ cookieExpiryDays = 30 }: { cookieExpiryDays?: number }) {
  return (
    <Suspense fallback={null}>
      <AffiliateTrackerContent cookieExpiryDays={cookieExpiryDays} />
    </Suspense>
  );
}
