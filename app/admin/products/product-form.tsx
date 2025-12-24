"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { ProductInputSchema, ProductUpdateSchema } from "@/lib/validator";
import { Checkbox } from "@/components/ui/checkbox";
import { toSlug } from "@/lib/utils";
import { IProductInput } from "@/types";
import ImageUploader from "./image-uploader";
import { toast } from "sonner";
import SubmitButton from "@/components/shared/submit-button";
import { useEffect } from "react";
import ColorInput from "./colors-input";
import SizeInput from "./size-input";
import MarkdownEditor from "react-markdown-editor-lite";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/lib/db/models/category.model";
import { IBrand } from "@/lib/db/models/brand.model";
import TagsInput from "./tag-input";
import MediaUploader from "@/components/shared/media-uploader";

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent form submission on Enter key press
  }
};

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === "development"
    ? {
        name: "Sample Product",
        slug: "sample-product",
        category: "Sample Category",
        subcategory: "Men",
        minicategory: "Sneakers",
        images: ["/images/p11-1.jpg"],
        brand: "Sample Brand",
        videoLink: "https://youtube.com",
        description: "This is a sample description of the product.",
        price: 99.99,
        listPrice: 0,
        countInStock: 15,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      }
    : {
        name: "",
        slug: "",
        category: "",
        subcategory: "",
        minicategory: "",

        images: [],
        brand: "",
        videoLink: "",
        description: "",
        price: 0,
        listPrice: 0,
        countInStock: 0,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      };

const ProductForm = ({
  type,
  product,
  productId,
  categories,
  brands,
}: {
  type: "Create" | "Update";
  product?: IProduct;
  productId?: string;
  categories: ICategory[];
  brands: IBrand[];
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  const form = useForm<IProductInput>({
    resolver:
      type === "Update"
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  async function onSubmit(values: IProductInput) {
    if (type === "Create") {
      const res = await createProduct(values);
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push(`/admin/products`);
      }
    }
    if (type === "Update") {
      if (!productId) {
        router.push(`/admin/products`);
        return;
      }
      const res = await updateProduct({ ...values, _id: productId });
      if (!res.success) {
        toast.error(res.message);
      } else {
        router.push(`/admin/products`);
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const images = form.watch("images");

  const nameValue = form.watch("name");

  // Update slug whenever name changes
  useEffect(() => {
    form.setValue("slug", toSlug(nameValue));
  }, [nameValue, form]);

  return (
    <FormProvider {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="space-y-8"
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
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
                  <Input placeholder="Enter product slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand (optional)</FormLabel>

                <Select
                  value={field.value || ""}
                  onValueChange={(val) =>
                    field.onChange(val === "none" ? "" : val)
                  }
                >
                  <FormControl className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {/* CLEAR OPTION */}
                    <SelectItem value="none">— No brand —</SelectItem>

                    {brands.map((brand) => (
                      <SelectItem key={brand.name} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoLink"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Video Link</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/xyz" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="listPrice"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>List Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product list price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Net Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="countInStock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Count In Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter product count in stock"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags Input */}
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-muted pb-4 md:pb-0 md:pr-4">
                <TagsInput field={field} />
              </div>
            )}
          />
        </div>

        {/* Colors and Sizes */}
        <div className="flex flex-col md:flex-row gap-5 mt-5">
          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-muted pb-4 md:pb-0 md:pr-4">
                <ColorInput field={field} label="Colors" />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
              <div className="w-full md:w-1/2">
                <SizeInput field={field} label="Sizes" />
              </div>
            )}
          />
        </div>

        {/* <MediaUploader
          form={form}
          name="images"
          label="Product Media"
          uploadRoute="products"
          multiple
          />*/}

        <ImageUploader form={form} />

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="w-full overflow-x-scroll">
                    <MarkdownEditor
                      {...field}
                      style={{ height: "500px" }}
                      onChange={({ text }) =>
                        form.setValue("description", text)
                      }
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
                  </div>
                </FormControl>
                <FormDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
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
        </div>
        <div>
          <SubmitButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="button col-span-2 w-full cursor-pointer"
            loadingText="Submitting..."
            size="lg"
          >
            {type} Product
          </SubmitButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
