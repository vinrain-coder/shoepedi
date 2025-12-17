"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import SubmitButton from "@/components/shared/submit-button";
import CategoryImageUploader from "./category-image-uploader";
import { CategoryInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";

// Infer values directly from your Zod schema
type CategoryFormValues = z.infer<typeof CategoryInputSchema>;

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
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      parent: category?.parent || "",
      description: category?.description || "",
      image: category?.image || "",
      isFeatured: category?.isFeatured || false,
      seoTitle: category?.seoTitle || "",
      seoDescription: category?.seoDescription || "",
      seoKeywords: category?.seoKeywords || [],
    },
  });

  const nameValue = form.watch("name");

  // Auto-generate slug from name in Create mode
  useEffect(() => {
    if (type === "Create" && nameValue) {
      form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, type]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      // Ensure "parent" is sent as null if empty, to match MongoId.nullable()
      const formattedValues = {
        ...values,
        parent: values.parent === "" ? null : values.parent,
      };

      const res =
        type === "Create"
          ? await createCategory(formattedValues)
          : await updateCategory({ ...formattedValues, _id: categoryId! });

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/categories");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-5xl mx-auto"
      >
        {/* Core Info: Name & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Nike Dunk Low" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="nike-dunk-low" />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Hierarchy & Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <select
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No Parent (Root Category)</option>
                  {categoriesList
                    .filter((cat) => cat._id !== categoryId) // Don't allow self-parenting
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Short description for admin use"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Media */}
        <div className="bg-slate-50 p-4 rounded-lg border border-dashed">
          <CategoryImageUploader form={form} />
        </div>
        {/* SEO Section */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-slate-700">
            SEO & Metadata
          </h3>

          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Meta title for search engines"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief summary for search results"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seoKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Keywords</FormLabel>
                <FormControl>
                  <Input
                    placeholder="sneakers, nike, dunk, low"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((k) => k.trim())
                      )
                    }
                  />
                </FormControl>
                <FormDescription>
                  Separate keywords with commas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Category</FormLabel>
                <FormDescription>
                  This category will be displayed on the homepage cards.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {/* Action Button */}
        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          {type === "Create" ? "Create Category" : "Update Category"}
        </SubmitButton>
      </form>
    </FormProvider>
  );
}
