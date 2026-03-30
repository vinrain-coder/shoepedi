"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, Truck, Clock } from "lucide-react";

export default function OrderPlacedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // Redirect after animation
    const timeout = setTimeout(() => {
      router.replace(`/account/orders/${orderId}`);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [orderId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 animate-gradient-shift" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute w-2 h-2 animate-confetti"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: "-10%",
              backgroundColor: [
                "#10b981",
                "#14b8a6",
                "#06b6d4",
                "#3b82f6",
                "#8b5cf6",
              ][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Success icon with ripple effect */}
        <div className="relative mx-auto mb-8 w-28 h-28 flex items-center justify-center animate-scale-in">
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-pulse" style={{ animationDelay: "0.2s" }} />
          
          {/* Icon container */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50 animate-bounce-gentle">
            <CheckCircle2 className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up-fade bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent" style={{ animationDelay: "0.2s" }}>
          Order Placed Successfully!
        </h1>

        {/* Emoji celebration */}
        <div className="flex items-center justify-center gap-2 mb-6 animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
          <span className="text-3xl animate-bounce" style={{ animationDelay: "0.1s" }}>馃帀</span>
          <span className="text-3xl animate-bounce" style={{ animationDelay: "0.2s" }}>鉁�</span>
          <span className="text-3xl animate-bounce" style={{ animationDelay: "0.3s" }}>馃帄</span>
        </div>

        {/* Order ID badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 mb-6 animate-slide-up-fade shadow-lg" style={{ animationDelay: "0.4s" }}>
          <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Order #{orderId?.slice(0, 8)}
          </span>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-slide-up-fade" style={{ animationDelay: "0.5s" }}>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
          </div>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform" style={{ transitionDelay: "0.1s" }}>
            <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Processing</p>
          </div>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform" style={{ transitionDelay: "0.2s" }}>
            <Truck className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Soon</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 animate-slide-up-fade" style={{ animationDelay: "0.6s" }}>
          We're preparing your order details and sending you a confirmation email.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-3 animate-slide-up-fade" style={{ animationDelay: "0.7s" }}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-emerald-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Redirecting text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Redirecting to order details...
        </p>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes slide-up-fade {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
    }
