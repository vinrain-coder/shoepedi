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
import { Truck, Gift, Headphones, Tag, ShieldCheck, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const aboutItems = [
  {
    icon: <Truck className="w-8 h-8" />,
    title: "Free Shipping",
    description: "Enjoy complimentary delivery on all orders over KES 5,000, bringing luxury to your doorstep.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: "Surprise Offers",
    description: "Unlock exclusive daily deals and save up to 50% on our premium selection of products.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: <Headphones className="w-8 h-8" />,
    title: "Expert Support",
    description: "Our dedicated specialists are available 24/7 to provide personalized shopping assistance.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: <Tag className="w-8 h-8" />,
    title: "Best Value",
    description: "Experience premium quality at competitive prices, ensuring value for every cent spent.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export function AboutCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  return (
    <section className="w-full py-12 md:py-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/20 text-primary font-medium">
              Why Choose Us
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            The <span className="text-primary">Difference</span> is in the Details
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            We're committed to providing an exceptional shopping experience built on trust, quality, and unparalleled service.
          </motion.p>
        </div>

        {/* Show Carousel on Small Screens */}
        <div className="block md:hidden">
          <Carousel
            dir="ltr"
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {aboutItems.map((item, index) => (
                <CarouselItem key={index}>
                  <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-center text-center p-6">
                      <div className={cn("mb-6 p-4 rounded-2xl", item.color)}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>

        {/* Show All Items in Grid on Medium & Large Screens */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {aboutItems.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-primary/5 bg-card/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center text-center p-8">
                  <div className={cn(
                    "mb-6 p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110",
                    item.color
                  )}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-primary/10 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider">SECURE PAYMENTS</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider">FAST DELIVERY</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider">100% GENUINE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
