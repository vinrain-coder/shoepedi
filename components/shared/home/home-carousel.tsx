"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ICarousel } from "@/types";
import { motion } from "framer-motion";

export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Carousel
      dir="ltr"
      plugins={[plugin.current]}
      setApi={setApi}
      className="w-full mx-auto relative group"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={item.title}>
            <Link href={item.url}>
              <div className="flex aspect-[16/8] md:aspect-[16/6] items-center justify-center p-6 relative overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent" />
                <div className="absolute w-2/3 md:w-1/3 left-8 md:left-32 top-1/2 transform -translate-y-1/2 z-10">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={cn(
                      "text-2xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg"
                    )}
                  >
                    {item.title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8"
                    >
                      {item.buttonCaption}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              current === i
                ? "bg-primary w-6"
                : "bg-white/50 hover:bg-white/80"
            )}
            onClick={() => api?.scrollTo(i)}
          />
        ))}
      </div>

      <CarouselPrevious className="hidden md:flex left-4 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" />
      <CarouselNext className="hidden md:flex right-4 bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" />
    </Carousel>
  );
}
