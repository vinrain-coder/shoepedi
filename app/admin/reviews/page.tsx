import { Metadata } from "next";
import Link from "next/link";

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteReview, getAllReviews } from "@/lib/actions/review.actions";
import { formatDateTime, formatId } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Reviews",
};

export default async function ReviewsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { page = "1" } = searchParams;

  const session = await getServerSession();
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const reviews = await getAllReviews({
    page: Number(page),
  });

  return (
    <div className="space-y-2">
      <h1 className="h1-bold">Reviews</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.data.map((review: any) => (
              <TableRow key={review._id}>
                <TableCell>{formatId(review._id)}</TableCell>
                <TableCell>
                  {formatDateTime(review.createdAt!).dateTime}
                </TableCell>
                <TableCell>
                  {review.user ? review.user.name : "Deleted User"}
                </TableCell>
                <TableCell>
                  {review.product.images?.length > 0 ? (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      width={64}
                      height={64}
                      className="object-cover rounded-md border"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </TableCell>
                <TableCell>
                  {review.product ? (
                    <Link
                      href={`/product/${review.product.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  ) : (
                    "Deleted Product"
                  )}
                </TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.title}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {review.comment}
                </TableCell>
                <TableCell>
                  {review.isVerifiedPurchase ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    "No"
                  )}
                </TableCell>
                <TableCell className="flex gap-1">
                  <DeleteDialog id={review._id} action={deleteReview} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reviews.totalPages > 1 && (
          <Pagination page={page} totalPages={reviews.totalPages} />
        )}
      </div>
    </div>
  );
}
