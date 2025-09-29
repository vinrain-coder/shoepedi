import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCategoriesForAdminProductInput } from "@/lib/actions/category.actions";

export default function CategoryInput({ form }: { form: any }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [minicategories, setMinicategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const data = await getAllCategoriesForAdminProductInput();
      setCategories(data);
    }
    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    const selected = categories.find((c) => c._id === categoryId);
    setSubcategories(selected?.subcategories || []);
    setMinicategories([]);
    form.setValue("category", categoryId);
    form.setValue("subcategory", "");
    form.setValue("minicategory", "");
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    const selected = subcategories.find((s) => s._id === subcategoryId);
    setMinicategories(selected?.subcategories || []);
    form.setValue("subcategory", subcategoryId);
    form.setValue("minicategory", "");
  };

  const handleMinicategoryChange = (minicategoryId: string) => {
    form.setValue("minicategory", minicategoryId);
  };

  return (
    <>
      {/* Category */}
      <div className="flex flex-col gap-5 md:flex-row">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Subcategory</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleSubcategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Minicategory */}
        {minicategories.length > 0 && (
          <FormField
            control={form.control}
            name="minicategory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Minicategory</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleMinicategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select minicategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {minicategories.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </>
  );
}
