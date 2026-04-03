"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck, Clock } from "lucide-react";
import { motion } from "framer-motion";

const colors = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"];

export default function OrderPlacedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 40);

    const timeout = setTimeout(() => {
      router.replace(`/account/orders/${orderId}`);
    }, 2500);

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
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">

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

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Success Icon with Sparkles */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative mx-auto mb-8 w-28 h-28 flex items-center justify-center"
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

          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
            <CheckCircle2 className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
        >
          Order Placed Successfully!
        </motion.h1>

        {/* Order ID Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 mb-6 shadow-lg"
        >
          <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Order #{orderId?.slice(0, 8)}
          </span>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />, label: "Confirmed" },
            { icon: <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />, label: "Processing" },
            { icon: <Truck className="h-5 w-5 text-blue-500 mx-auto mb-1" />, label: "Soon" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
            >
              {item.icon}
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/50"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.3 }}
          />
        </motion.div>

        <motion.p
          className="text-sm text-gray-500 dark:text-gray-400 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, repeat: Infinity, repeatType: "reverse" }}
        >
          Redirecting to order details...
        </motion.p>
      </div>
    </div>
  );
}
