import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="group flex flex-col rounded-2xl border bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent className="p-5 flex-1">
            {/* Card Title */}
            <h3 className="text-lg md:text-xl font-semibold tracking-tight mb-5 border-b pb-2">
              {card.title}
            </h3>

            {/* Items Grid */}
            <div className="grid grid-cols-2 gap-5">
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center text-center group/item"
                >
                  {/* Image Wrapper */}
                  <div className="relative w-full aspect-square rounded-xl bg-gray-100 p-3 flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width:768px) 50vw, 120px"
                      className="object-contain transition-transform duration-300 group-hover/item:scale-105"
                    />
                  </div>

                  {/* Item Name */}
                  <p className="mt-2 text-sm font-medium text-gray-700 line-clamp-2 group-hover/item:text-black transition-colors">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>

          {/* Footer Button */}
          {card.link && (
            <CardFooter className="px-5 pb-5">
              <Link
                href={card.link.href}
                className="w-full inline-flex items-center justify-center rounded-lg bg-black text-white text-sm font-medium py-2.5 px-4 hover:bg-gray-800 transition-colors"
              >
                {card.link.text}
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  
);
}
