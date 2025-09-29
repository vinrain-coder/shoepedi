"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/shared/submit-button";
import CategoryImageUploader from "./category-image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CategoryInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";

interface SubcategoryForm {
  name: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface CategoryFormValues {
  name: string;
  slug: string;
  parent?: string;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  subcategories: SubcategoryForm[];
}

interface CategoryFormProps {
  type: "Create" | "Update";
  category?: Partial<CategoryFormValues>;
  categoryId?: string;
  categoriesList?: { _id: string; name: string }[];
}

export default function CategoryForm({
  type,
  category,
  categoryId,
  categoriesList = [],
}: CategoryFormProps) {
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: category || {
      name: "",
      slug: "",
      parent: "root", // default value for Select
      description: "",
      image: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      subcategories: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "subcategories",
    control: form.control,
  });

  const nameValue = form.watch("name");

  // Auto-generate slug
  useEffect(() => {
    form.setValue("slug", toSlug(nameValue));
  }, [nameValue, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    // convert "root" parent to undefined
    const payload = {
      ...values,
      parent: values.parent === "root" ? undefined : values.parent,
    };

    console.log("Form Submitted!", values);
    alert("Form Submitted! Check console");

    try {
      const res =
        type === "Create"
          ? await createCategory(payload)
          : await updateCategory({ ...payload, _id: categoryId! });

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/categories");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Category Name & Slug */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Auto-generated slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parent Category & Description */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Parent Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="No Parent (Root Category)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">
                        No Parent (Root Category)
                      </SelectItem>
                      {categoriesList.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Category description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Uploader */}
        <CategoryImageUploader form={form} />

        {/* SEO Fields */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input placeholder="SEO title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>SEO Description</FormLabel>
                <FormControl>
                  <Input placeholder="SEO description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoKeywords"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>SEO Keywords</FormLabel>
                <FormDescription>Separate keywords with commas</FormDescription>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((k) => k.trim())
                      )
                    }
                    placeholder="e.g. shoes, sneakers"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subcategories */}
        <div className="space-y-4">
          <h3 className="font-semibold">Subcategories</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded space-y-2">
              <div className="flex flex-col gap-5 md:flex-row">
                <FormField
                  control={form.control}
                  name={`subcategories.${index}.name` as const}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Subcategory Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Subcategory Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`subcategories.${index}.seoTitle` as const}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-5 md:flex-row">
                <FormField
                  control={form.control}
                  name={`subcategories.${index}.seoDescription` as const}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`subcategories.${index}.seoKeywords` as const}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>SEO Keywords</FormLabel>
                      <FormDescription>
                        Separate keywords with commas
                      </FormDescription>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(",").map((k) => k.trim())
                            )
                          }
                          placeholder="e.g. subcat1, subcat2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Remove Subcategory
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              append({
                name: "",
                seoTitle: "",
                seoDescription: "",
                seoKeywords: [],
              })
            }
          >
            Add Subcategory
          </Button>
        </div>

        {/* Submit */}
        <button type="submit" className="w-full">
          {type} Category
        </button>
      </form>
    </FormProvider>
  );
}
