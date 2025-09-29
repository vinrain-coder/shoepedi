"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

import { CategoryInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";
import SubmitButton from "@/components/shared/submit-button";
import CategoryImageUploader from "./category-image-uploader";

interface CategoryFormProps {
  type: "Create" | "Update";
  category?: any; // Replace with ICategory type if available
  categoryId?: string;
  categoriesList?: any[]; // Existing categories for parent selection
}

const CategoryForm = ({
  type,
  category,
  categoryId,
  categoriesList = [],
}: CategoryFormProps) => {
  const router = useRouter();

  const form = useForm<any>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: category || {
      name: "",
      slug: "",
      parent: null,
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

  const onSubmit = async (values: any) => {
    try {
      if (type === "Create") {
        const res = await createCategory(values);
        if (res.success) {
          toast.success(res.message);
          router.push("/admin/categories");
        } else {
          toast.error(res.message);
        }
      } else {
        if (!categoryId) return;
        const res = await updateCategory({ ...values, _id: categoryId });
        if (res.success) {
          toast.success(res.message);
          router.push("/admin/categories");
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Category Fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="auto-generated slug" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <select {...field} className="border rounded px-2 py-1 w-full">
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
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Category description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryImageUploader form={form} />

        {/* SEO Fields */}
        <FormField
          control={form.control}
          name="seoTitle"
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
          name="seoDescription"
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
          name="seoKeywords"
          render={({ field }) => (
            <FormItem>
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
                  placeholder="e.g. shoes, sneakers, jordan"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcategories with SEO */}
        <div className="space-y-2">
          <h3 className="font-semibold">Subcategories</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded space-y-2">
              <FormField
                control={form.control}
                name={`subcategories.${index}.name`}
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
                name={`subcategories.${index}.seoTitle`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="SEO title for subcategory"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`subcategories.${index}.seoDescription`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="SEO description for subcategory"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`subcategories.${index}.seoKeywords`}
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

              <Button variant="destructive" onClick={() => remove(index)}>
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

        <SubmitButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
          loadingText="Submitting..."
          size="lg"
        >
          {type} Category
        </SubmitButton>
      </form>
    </FormProvider>
  );
};

export default CategoryForm;
