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
import { Textarea } from "@/components/ui/textarea";
import SubmitButton from "@/components/shared/submit-button";

import BrandImageUploader from "./brand-image-uploader";

import { BrandInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createBrand, updateBrand } from "@/lib/actions/brand.actions";

// Infer values directly from your Zod schema
type BrandFormValues = z.infer<typeof BrandInputSchema>;

interface BrandFormProps {
  type: "Create" | "Update";
  brand?: Partial<BrandFormValues>;
  brandId?: string;
  brandsList?: { _id: string; name: string }[];
}

export default function BrandForm({
  type,
  brand,
  brandId,
  brandsList = [],
}: BrandFormProps) {
  const router = useRouter();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandInputSchema),
    defaultValues: {
      name: brand?.name || "",
      slug: brand?.slug || "",
      parent: brand?.parent || "",
      description: brand?.description || "",
      image: brand?.image || "",
      isFeatured: brand?.isFeatured || false,
      seoTitle: brand?.seoTitle || "",
      seoDescription: brand?.seoDescription || "",
      seoKeywords: brand?.seoKeywords || [],
    },
  });

  const nameValue = form.watch("name");

  // Auto-generate slug in Create mode
  useEffect(() => {
    if (type === "Create" && nameValue) {
      form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, form, type]);

  const onSubmit = async (values: BrandFormValues) => {
    try {
      const formattedValues = {
        ...values,
        parent: values.parent === "" ? null : values.parent,
      };

      const res =
        type === "Create"
          ? await createBrand(formattedValues)
          : await updateBrand({ ...formattedValues, _id: brandId! });

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/brands");
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
        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Nike" />
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
                  <Input {...field} placeholder="nike" />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the brand name.
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
                <FormLabel>Parent Brand</FormLabel>
                <select
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">No Parent</option>
                  {brandsList
                    .filter((b) => b._id !== brandId)
                    .map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
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
                    placeholder="Short brand description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Media */}
        <div className="bg-slate-50 p-4 rounded-lg border border-dashed">
          <BrandImageUploader form={form} />
        </div>

        {/* SEO */}
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
                  <Input {...field} placeholder="Meta title" />
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
                    placeholder="Meta description"
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
                    placeholder="nike, sneakers, sportswear"
                    value={field.value?.join(", ") || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((k) => k.trim())
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

        {/* Featured */}
        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 rounded-md border p-4 shadow-sm">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Brand</FormLabel>
                <FormDescription>
                  Display this brand on the homepage.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          {type === "Create" ? "Create Brand" : "Update Brand"}
        </SubmitButton>
      </form>
    </FormProvider>
  );
  }
  
