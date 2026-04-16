"use client";

import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct } from "@/lib/server/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { cn, formatDateTime, formatId } from "@/lib/utils";
import { EyeIcon, PenBox } from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/shared/pagination";
import ProductPrice from "@/components/shared/product/product-price";

type ProductListDataProps = {
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  to: number;
  from: number;
};

interface ProductListProps {
  data: ProductListDataProps;
  page: number;
}

const ProductList = ({ data, page }: ProductListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.totalProducts === 0
            ? "No products found"
            : `Showing ${data.from}-${data.to} of ${data.totalProducts} products`}
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Id</TableHead>
              <TableHead className="w-20">Image</TableHead>
              <TableHead className="w-60">Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.length > 0 ? (
              data.products.map((product: IProduct) => (
                <TableRow key={product._id.toString()}>
                  <TableCell className="font-mono text-xs">
                    {formatId(product._id.toString())}
                  </TableCell>
                  <TableCell>
                    {product.images?.length > 0 ? (
                      <div className="relative aspect-square w-12 overflow-hidden rounded-md border">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-[10px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate font-medium">
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductPrice price={product.price} plain />
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "font-medium",
                        product.countInStock <= 0
                          ? "text-rose-600"
                          : product.countInStock <= 10
                          ? "text-orange-600"
                          : ""
                      )}
                    >
                      {product.countInStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{product.avgRating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({product.numReviews})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(product.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" title="Edit">
                        <Link href={`/admin/products/${product._id}`}>
                          <PenBox className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" title="View">
                        <Link target="_blank" href={`/product/${product.slug}`}>
                          <EyeIcon className="size-4" />
                        </Link>
                      </Button>
                      <DeleteDialog id={product._id.toString()} action={deleteProduct} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page.toString()} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
};

export default ProductList;
