"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/shared/breadcrumb";
import { GuestSignUpForm } from "./signup-form";
import { getOrderById } from "@/lib/actions/order.actions";
import { SerializedOrder } from "@/lib/actions/order.actions";
import { formatId } from "@/lib/utils";

const colors = ["#EAB308", "#CA8A04", "#A16207", "#FACC15", "#854D0E"];

export default function OrderPlacedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const accessToken = searchParams.get("accessToken");
  const [progress, setProgress] = useState(0);
  const [order, setOrder] = useState<SerializedOrder | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId, accessToken || undefined).then(setOrder);
    }
  }, [orderId, accessToken]);

  // Auto-redirection removed per user request for better UX

  const confettiParticles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: Math.random() * 360,
  }));

  const sparkles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: 20 + Math.random() * 20,
    delay: Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-muted/10 to-background py-20">
      <div className="absolute top-4 z-20">
        <Breadcrumb />
      </div>

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

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-foreground"
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-muted/50 dark:bg-muted/30 border border-muted-foreground/20 mb-8 shadow-sm"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Order #{order ? formatId(order._id) : formatId(orderId || "")}
          </span>
        </motion.div>

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
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">{item.label}</p>
            </div>
          ))}
        </motion.div>


        {accessToken && orderId && (
            <GuestSignUpForm
                orderId={orderId}
                accessToken={accessToken}
                defaultEmail={order?.userEmail || ""}
                defaultName={order?.userName || ""}
            />
        )}
        {accessToken && orderId && (
          <div className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(`/account/orders/${orderId}?accessToken=${accessToken}`)}`}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Sign in to link this order
            </Link>
          </div>
        )}

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
            <Link
                href={accessToken
                ? `/account/orders/${orderId}?accessToken=${accessToken}`
                : `/account/orders/${orderId}`}
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
  );
}
