import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllCategories } from "@/lib/actions/product.actions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function Search() {
  const {
    site: { name },
  } = await getSetting();
  const categories = await getAllCategories();

  return (
    <form action="/search" method="GET" className="flex items-stretch h-9">
      <Select name="category">
        <SelectTrigger className="w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none cursor-pointer">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">All</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="flex-1 rounded-none dark:border-gray-200 bg-gray-100 text-black dark:text-white text-base h-full"
        placeholder={`Search ${name}`}
        name="q"
        type="search"
      />
      <button
        type="submit"
        className="bg-primary text-black rounded-s-none rounded-e-md h-9 px-3 py-2 cursor-pointer"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  );
}
