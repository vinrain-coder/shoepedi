import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export type CardItem = {
  title: string;
  link: { text: string; href: string };
  items: {
    name: string;
    items?: string[];
    image: string;
    href: string;
  }[];
};

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="rounded-2xl border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card flex flex-col overflow-hidden"
        >
          <CardContent className="p-5 flex-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground/90 mb-6">{card.title}</h3>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/50 mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-center text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className="p-5 pt-0">
              <Link
                href={card.link.href}
                className="text-primary text-sm font-bold hover:underline inline-flex items-center gap-1 group/link transition-all"
              >
                {card.link.text}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
