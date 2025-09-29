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
import { CategoryInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";
import { ICategoryInput } from "@/types";

interface SubcategoryForm {
  name: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

interface CategoryFormValues extends ICategoryInput {}

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
      parent: "",
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
    // @ts-ignore
    form.setValue("slug", toSlug(nameValue));
  }, [nameValue, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    console.log("Submitting form values:", values); // ✅ Log values
    try {
      const res =
        type === "Create"
          ? await createCategory(values)
          : await updateCategory({ ...values, _id: categoryId! });

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        noValidate
      >
        {/* Name & Slug */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter category name" />
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
                  <Input {...field} placeholder="Auto-generated slug" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parent & Description */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Parent Category</FormLabel>
                <FormControl>
                  {/* Use native select for simplicity */}
                  <select
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">No Parent (Root Category)</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                  <Input {...field} placeholder="Category description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image */}
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
                  <Input {...field} placeholder="SEO title" />
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
                  <Input {...field} placeholder="SEO description" />
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
              <FormField
                control={form.control}
                name={`subcategories.${index}.name` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Subcategory Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`subcategories.${index}.seoTitle` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SEO title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`subcategories.${index}.seoDescription` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SEO description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`subcategories.${index}.seoKeywords` as const}
                render={({ field }) => (
                  <FormItem>
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
        <SubmitButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
          loadingText="Submitting..."
        >
          {type} Category
        </SubmitButton>
      </form>
    </FormProvider>
  );
}
