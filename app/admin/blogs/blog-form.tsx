"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MarkdownEditor from "react-markdown-editor-lite";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createBlog, updateBlog } from "@/lib/actions/blog.actions";
import { BlogInputSchema, BlogUpdateSchema } from "@/lib/validator";
import { toast } from "sonner";
import { IBlog } from "@/lib/db/models/blog.model";
import { toSlug } from "@/lib/utils";
import { X } from "lucide-react";
import SubmitButton from "@/components/shared/submit-button";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import MediaUploader from "@/components/shared/media-uploader";

// Set default values correctly based on the BlogInputSchema
const blogDefaultValues = {
  title: "",
  slug: "",
  image: "",
  content: "",
  category: "",
  views: 0,
  tags: [],
  isPublished: false,
  publishedAt: undefined,
};

const BlogForm = ({
  type,
  blog,
  blogId,
}: {
  type: "Create" | "Update";
  blog?: IBlog;
  blogId?: string;
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const form = useForm<z.infer<typeof BlogInputSchema>>({
    resolver: zodResolver(
      type === "Update" ? BlogUpdateSchema : BlogInputSchema
    ),
    defaultValues: blog && type === "Update" ? blog : blogDefaultValues,
  });

  async function onSubmit(values: z.infer<typeof BlogInputSchema>) {
    let res;
    if (type === "Create") {
      res = await createBlog(values);
    } else {
      if (!blogId) {
        router.push(`/admin/blogs`);
        return;
      }
      res = await updateBlog({ ...values, _id: blogId });
    }

    if (res.success) {
      toast.success(res.message);
      router.push(`/admin/blogs`);
    } else {
      toast.error(res.message);
    }
  }

  const nameValue = form.watch("title");

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue));
  }, [nameValue, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title and Slug */}
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
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
                  <div className="relative">
                    <Input
                      placeholder="Enter slug"
                      className="pl-8"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        form.setValue("slug", toSlug(form.getValues("title")))
                      }
                      className="absolute right-2 top-2.5 text-white bg-primary"
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Input */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {(field.value || []).map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg p-2"
                    >
                      <Input
                        autoFocus={index === (field.value || []).length - 1}
                        className="w-full bg-transparent focus:outline-none focus:ring-2 rounded-lg"
                        value={tag}
                        onChange={(e) => {
                          const updatedTags = [...(field.value || [])];
                          updatedTags[index] = e.target.value;
                          field.onChange(updatedTags);
                        }}
                        placeholder="Enter a tag"
                        onKeyDown={(e) =>
                          e.key === "Enter" && e.preventDefault()
                        }
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const updatedTags = (field.value || []).filter(
                            (_, i) => i !== index
                          );
                          field.onChange(updatedTags);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const updatedTags = [...(field.value || []), ""];
                    field.onChange(updatedTags);
                  }}
                  className="mt-2 w-full"
                >
                  Add Tag
                </Button>
              </div>
            </FormItem>
          )}
        />

        <div className="bg-slate-50 p-4 rounded-lg border border-dashed">
          <MediaUploader
            form={form}
            label="image"
            name="Blog image"
            uploadRoute="blogs"
          />
        </div>

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MarkdownEditor
                  {...field}
                  style={{ height: "500px" }}
                  onChange={({ text }) => form.setValue("content", text)}
                  renderHTML={(text) => (
                    <div
                      className={`prose max-w-none ${
                        theme === "dark" ? "prose-invert" : ""
                      }`}
                    >
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Is Published */}
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Is Published?</FormLabel>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <SubmitButton
          isLoading={form.formState.isSubmitting}
          loadingText="Submitting..."
          size="lg"
        >
          {type} Blog
        </SubmitButton>
      </form>
    </Form>
  );
};

export default BlogForm;
