"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFilterUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProductSortSelector({
  sortOrders,
  sort,
  params,
  basePath,
}: {
  sortOrders: { value: string; name: string }[];
  sort: string;
  params: {
    q?: string;
    category?: string;
    tag?: string;
    brand?: string;
    gender?: string;
    color?: string;
    size?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
  basePath?: string;
}) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(v) => {
        router.push(getFilterUrl({ params, sort: v, basePath }));
      }}
      value={sort}
    >
      <SelectTrigger className="cursor-pointer">
        <SelectValue>
          Sort By: {sortOrders.find((s) => s.value === sort)?.name}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {sortOrders.map((s) => (
          <SelectItem key={s.value} value={s.value} className="cursor-pointer">
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
