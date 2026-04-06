"use client";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ImageIcon,
  Info,
  Package,
  SettingsIcon,
} from "lucide-react";

import { useEffect, useState } from "react";

const SettingNav = () => {
  const [active, setActive] = useState("");

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
      { threshold: 0.6, rootMargin: "0px 0px -40% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const top = section.offsetTop - 16; // 20px above the section
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="md:sticky md:top-20 self-start">
      <nav className="flex md:flex-col gap-1 mt-4 flex-wrap overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        {[
          { name: "Site Info", hash: "setting-site-info", icon: <Info className="h-4 w-4" /> },
          {
            name: "Common",
            hash: "setting-common",
            icon: <SettingsIcon className="h-4 w-4" />,
          },
          {
            name: "Carousels",
            hash: "setting-carousels",
            icon: <ImageIcon className="h-4 w-4" />,
          },
          {
            name: "Payments",
            hash: "setting-payment-methods",
            icon: <CreditCard className="h-4 w-4" />,
          },
          {
            name: "Delivery",
            hash: "setting-delivery-dates",
            icon: <Package className="h-4 w-4" />,
          },
          {
            name: "Affiliate",
            hash: "setting-affiliate",
            icon: <Info className="h-4 w-4" />,
          },
        ].map((item) => (
          <Button
            onClick={() => handleScroll(item.hash)}
            key={item.hash}
            variant="ghost"
            className={`justify-start cursor-pointer px-4 py-2 h-9 text-sm font-medium transition-all duration-200 gap-3 group relative
              ${active === item.hash
                ? "bg-linear-to-r from-primary/10 via-primary/5 to-transparent text-primary border-r-2 border-primary rounded-none"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {item.icon}
            <span className="relative z-10">{item.name}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default SettingNav;
