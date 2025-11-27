"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Truck, Gift, Headphones, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const aboutItems = [
  {
    icon: <Truck className="w-12 h-12 text-primary" />,
    title: "Free Shipping",
    description: "From all orders above  5,000.",
  },
  {
    icon: <Gift className="w-12 h-12 text-primary" />,
    title: "Daily Surprise Offers",
    description: "Save up to 50% off.",
  },
  {
    icon: <Headphones className="w-12 h-12 text-primary" />,
    title: "Support 24/7",
    description: "Shop with an expert.",
  },
  {
    icon: <Tag className="w-12 h-12 text-primary" />,
    title: "Affordable Prices",
    description: "Reduce pocket strain.",
  },
];

export function AboutCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <div className="w-full my-4">
      <Separator className={cn("mb-4")} />
      {/* Section Heading */}
      <h2 className="font-bold text-xl mb-4">Why You Should Choose Us</h2>

      {/* Show Carousel on Small Screens */}
      <div className="block md:hidden">
        <Carousel
          dir="ltr"
          plugins={[plugin.current]}
          className="w-full mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {aboutItems.map((item, index) => (
              <CarouselItem key={index} className="flex justify-center">
                <div className="flex flex-col items-center text-center gap-4 p-6 md:p-12 rounded-lg">
                  {item.icon}
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-gray-800 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Show All Items in Grid on Medium & Large Screens */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        {aboutItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-4 p-6 rounded-lg"
          >
            {item.icon}
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-gray-800 dark:text-gray-300">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
