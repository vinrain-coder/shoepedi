"use client";

import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ImageIcon,
  Info,
  Package,
  SettingsIcon,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SettingNav = () => {
  const [active, setActive] = useState("setting-site-info");

  useEffect(() => {
    const sections = document.querySelectorAll('div[id^="setting-"]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-10% 0px -70% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const top = section.offsetTop - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActive(id);
    }
  };

  const navItems = [
    { name: "Site Identity", hash: "setting-site-info", icon: Info },
    { name: "General Rules", hash: "setting-common", icon: SettingsIcon },
    { name: "Home Carousels", hash: "setting-carousels", icon: ImageIcon },
    { name: "Payment Logic", hash: "setting-payment-methods", icon: CreditCard },
    { name: "Delivery Speeds", hash: "setting-delivery-dates", icon: Package },
    { name: "Affiliate Rules", hash: "setting-affiliate", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col gap-1 pr-4">
      {navItems.map((item) => {
        const isActive = active === item.hash;
        const Icon = item.icon;

        return (
          <Button
            key={item.hash}
            variant="ghost"
            onClick={() => handleScroll(item.hash)}
            className={cn(
              "group relative flex w-full items-center justify-between px-4 py-6 transition-all duration-200 hover:bg-primary/5",
              isActive
                ? "bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-r-2 border-primary text-primary font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "rounded-lg p-2 transition-colors",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm tracking-tight">{item.name}</span>
            </div>
            {isActive && <ChevronRight className="h-4 w-4 animate-in fade-in slide-in-from-left-2" />}
          </Button>
        );
      })}
    </div>
  );
};

export default SettingNav;
