"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/shared/breadcrumb";

const colors = ["#EAB308", "#CA8A04", "#A16207", "#FACC15", "#854D0E"]; // Primary-aligned gold/yellow palette

export default function OrderPlacedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
  setProgress((prev) => Math.min(prev + (100 / 60), 100)); 
  // 3000ms / 50ms = 60 steps → reach 100 in 3s
   }, 50);

    const timeout = setTimeout(() => {
    router.replace(`/account/orders/${orderId}`);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderId, router]);

  // Confetti particles
  const confettiParticles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: Math.random() * 360,
  }));

  // Sparkles around the icon
  const sparkles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 20 + Math.random() * 20,
    delay: Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="absolute top-4 left-4 z-20">
        <Breadcrumb />
      </div>

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full"
            style={{ left: `${p.x}%`, backgroundColor: p.color }}
            initial={{ y: -10, opacity: 1, rotate: 0 }}
            animate={{ y: "100vh", opacity: 0, rotate: 720 + p.rotate }}
            transition={{ delay: p.delay, duration: p.duration, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Success Icon with Sparkles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative mx-auto mb-10 w-32 h-32 flex items-center justify-center"
        >
          {sparkles.map((s) => {
            const x = s.distance * Math.cos((s.angle * Math.PI) / 180);
            const y = s.distance * Math.sin((s.angle * Math.PI) / 180);
            return (
              <motion.div
                key={s.id}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x, y, opacity: 0 }}
                transition={{ delay: s.delay, duration: 0.6, ease: "easeOut" }}
              />
            );
          })}

          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
            <CheckCircle2 className="h-12 w-12 text-primary-foreground drop-shadow-md" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground"
        >
          Order Placed Successfully!
        </motion.h1>

        {/* Order ID Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted/50 dark:bg-muted/30 border border-muted-foreground/20 mb-8 shadow-sm"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Order #{orderId?.slice(0, 12)}
          </span>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-2" />, label: "Confirmed" },
            { icon: <Clock className="h-5 w-5 text-primary mx-auto mb-2" />, label: "Processing" },
            { icon: <Truck className="h-5 w-5 text-blue-500 mx-auto mb-2" />, label: "Delivered Soon" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              {item.icon}
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Progress Bar & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <motion.div
              className="w-full bg-muted rounded-full h-1.5 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </motion.div>
            <motion.p
              className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Auto-redirecting in a moment...
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href={`/account/orders/${orderId}`}
              className={cn(buttonVariants({ size: "lg", variant: "default" }), "w-full sm:w-auto font-bold gap-2 px-8")}
            >
              View Order Details <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto")}
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
