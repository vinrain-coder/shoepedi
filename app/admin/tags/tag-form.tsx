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
import SubmitButton from "@/components/shared/submit-button";

import { TagInputSchema } from "@/lib/validator";
import { toSlug } from "@/lib/utils";
import { createTag, updateTagAction } from "@/lib/actions/tag.actions";

/* ---------------- Types ---------------- */
type TagFormValues = z.infer<typeof TagInputSchema>;

interface TagFormProps {
  type: "Create" | "Update";
  tag?: Partial<TagFormValues>;
  tagId?: string;
}

/* ---------------- Component ---------------- */
export default function TagForm({
  type,
  tag,
  tagId,
}: TagFormProps) {
  const router = useRouter();

  const form = useForm<TagFormValues>({
    resolver: zodResolver(TagInputSchema),
    defaultValues: {
      name: tag?.name ?? "",
      slug: tag?.slug ?? "",
      description: tag?.description ?? "",
    },
  });

  const nameValue = form.watch("name");

  /* -------- Auto-generate slug -------- */
  useEffect(() => {
    if (type === "Create" && nameValue) {
      form.setValue("slug", toSlug(nameValue), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [nameValue, form, type]);

  /* ---------------- Submit ---------------- */
  const onSubmit = async (values: TagFormValues) => {
    try {
      const res =
        type === "Create"
          ? await createTag(values)
          : await updateTagAction({
              ...values,
              _id: tagId!,
            });

      if (res.success) {
        toast.success(res.message);
        router.push("/admin/tags");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full"
      >
        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Running" />
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
                  <Input {...field} placeholder="running" />
                </FormControl>
                <FormDescription>
                  URL-friendly version of the tag name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Short tag description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <SubmitButton
            isLoading={form.formState.isSubmitting}
          >
            {type === "Create" ? "Create Tag" : "Update Tag"}
          </SubmitButton>
        </div>
      </form>
    </FormProvider>
  );
        }
  
