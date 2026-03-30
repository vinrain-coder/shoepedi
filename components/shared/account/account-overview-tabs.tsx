"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AccountCard = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

type AccountCardGroup = {
  value: string;
  label: string;
  cards: AccountCard[];
};

export default function AccountOverviewTabs({
  groups,
}: {
  groups: AccountCardGroup[];
}) {
  return (
    <Tabs defaultValue={groups[0]?.value} className="gap-4">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border bg-muted/60 p-1">
        {groups.map((group) => (
          <TabsTrigger
            key={group.value}
            value={group.value}
            className="h-9 min-w-[120px] data-[state=active]:shadow-sm"
          >
            {group.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map((group) => (
        <TabsContent key={group.value} value={group.value}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
            {group.cards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.href}
                  className="group overflow-hidden border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link href={card.href} className="block h-full">
                    <CardContent className="flex h-full items-start gap-4 p-5">
                      <div className="rounded-xl border bg-muted/50 p-2.5 text-primary transition-colors group-hover:bg-primary/10">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">{card.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
