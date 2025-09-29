"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { CategoryInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";
import CategoryImageUploader from "./category-image-uploader";
import SubmitButton from "@/components/shared/submit-button";

interface CategoryFormProps {
  type: "Create" | "Update";
  category?: any;
  categoryId?: string;
  categoriesList?: any[];
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

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue));
  }, [nameValue, form]);

  const onSubmit = async (values: any) => {
    try {
      const res =
        type === "Create"
          ? await createCategory(values)
          : await updateCategory({ ...values, _id: categoryId });
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/categories");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
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

        {/* Slug */}
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

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value || undefined} // undefined instead of ""
                  onValueChange={(val) => field.onChange(val || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No Parent (Root Category)" />
                  </SelectTrigger>
                  <SelectContent>
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

        {/* Description */}
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
        {["seoTitle", "seoDescription", "seoKeywords"].map((key) => (
          <FormField
            key={key}
            control={form.control}
            name={key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {key === "seoKeywords"
                    ? "SEO Keywords"
                    : key === "seoTitle"
                    ? "SEO Title"
                    : "SEO Description"}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      key === "seoKeywords"
                        ? "Separate keywords with commas"
                        : `Enter ${key}`
                    }
                    onChange={(e) =>
                      key === "seoKeywords" &&
                      field.onChange(
                        e.target.value.split(",").map((k) => k.trim())
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Subcategories */}
        <div className="space-y-4">
          <h3 className="font-semibold">Subcategories</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded space-y-2">
              {["name", "seoTitle", "seoDescription", "seoKeywords"].map(
                (key) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={`subcategories.${index}.${key}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {key === "name"
                            ? "Subcategory Name"
                            : key === "seoTitle"
                            ? "SEO Title"
                            : key === "seoDescription"
                            ? "SEO Description"
                            : "SEO Keywords"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              key === "seoKeywords"
                                ? "Separate keywords with commas"
                                : `Enter ${key}`
                            }
                            onChange={(e) =>
                              key === "seoKeywords" &&
                              field.onChange(
                                e.target.value.split(",").map((k) => k.trim())
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )
              )}
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
          isLoading={form.formState.isSubmitting}
          loadingText="Submitting..."
        >
          {type} Category
        </SubmitButton>
      </form>
    </FormProvider>
  );
};

export default CategoryForm;
