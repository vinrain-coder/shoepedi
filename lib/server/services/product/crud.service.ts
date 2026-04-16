import { revalidatePath, updateTag } from "next/cache";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { formatError } from "@/lib/utils";
import { ProductInputSchema, ProductUpdateSchema } from "@/lib/validator";
import { IProductInput } from "@/types";
import { connectToDatabase, Product } from "./shared";

const utapi = new UTApi();

export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data);
    await connectToDatabase();
    await Product.create(product);
    revalidatePath("/admin/products");
    updateTag("products");
    return { success: true, message: "Product created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data);
    await connectToDatabase();
    await Product.findByIdAndUpdate(product._id, product);
    revalidatePath("/admin/products");
    updateTag("products");
    return { success: true, message: "Product updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    await Promise.all(
      (product.images || []).map(async (imageUrl: string) => {
        const fileKey = imageUrl.split("/").pop();
        if (fileKey) await utapi.deleteFiles(fileKey);
      }),
    );

    await Product.findByIdAndDelete(id);
    revalidatePath("/admin/products");
    updateTag("products");

    return {
      success: true,
      message: "Product and associated images deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
