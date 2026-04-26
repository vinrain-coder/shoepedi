"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm"
        >
          <FileQuestion className="h-12 w-12" />
        </motion.div>

        {/* Text Content */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved to a new
          address.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-full px-8 transition-all hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>

          <Button
            size="lg"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-full px-8 shadow-md hover:shadow-lg transition-all"
          >
            <Home className="h-4 w-4" />
            Back Home
          </Button>
        </div>

        {/* Help Link */}
        <p className="mt-12 text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/page/support"
            className="font-medium text-primary hover:underline"
          >
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
