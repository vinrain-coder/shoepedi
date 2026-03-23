import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareReply, Star } from "lucide-react";

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import ReviewReplyForm from "./review-reply-form";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deleteReview, getAllReviews } from "@/lib/actions/review.actions";
import { IReviewDetails } from "@/types";
import { getServerSession } from "@/lib/get-session";
import { formatDateTime, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Reviews",
};

type AdminReviewRow = IReviewDetails & {
  user?: {
    name?: string;
    email?: string;
  };
  product?: {
    name?: string;
    slug?: string;
    images?: string[];
  };
};

export default async function ReviewsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { page = "1" } = searchParams;

  const session = await getServerSession();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const reviews = await getAllReviews({
    page: Number(page),
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate feedback, preview images, and respond to customers.
        </p>
      </div>

      {/* TABLE CONTAINER */}
      <div className="rounded-3xl border bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            {/* HEADER */}
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
              <TableRow>
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="min-w-[220px]">Product</TableHead>
                <TableHead className="min-w-[180px]">Customer</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead className="min-w-[320px]">Review</TableHead>
                <TableHead className="min-w-[280px]">Reply</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {(reviews.data as AdminReviewRow[]).map((review) => (
                <TableRow
                  key={review._id}
                  className="align-top hover:bg-muted/30 transition"
                >
                  {/* ID */}
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {formatId(review._id)}
                  </TableCell>

                  {/* DATE */}
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(review.createdAt!).dateTime}
                  </TableCell>

                  {/* PRODUCT */}
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {review.product?.images?.length ? (
                        <Image
                          src={review.product.images[0]}
                          alt={review.product.name || "product"}
                          width={60}
                          height={60}
                          className="rounded-xl border object-cover shrink-0"
                        />
                      ) : null}

                      <div className="space-y-1">
                        {review.product ? (
                          <Link
                            href={`/product/${review.product.slug}`}
                            className="font-medium text-primary hover:underline line-clamp-2"
                          >
                            {review.product.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">
                            Deleted product
                          </span>
                        )}

                        <Badge variant="outline" className="rounded-full text-xs">
                          {review.isVerifiedPurchase
                            ? "Verified"
                            : "Feedback"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">
                        {review.user?.name || "Deleted user"}
                      </div>
                      <div className="text-muted-foreground text-xs truncate max-w-[180px]">
                        {review.user?.email || "—"}
                      </div>
                    </div>
                  </TableCell>

                  {/* RATING */}
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      <Star className="size-4 fill-primary text-primary" />
                      {review.rating}
                    </div>
                  </TableCell>

                  {/* REVIEW */}
                  <TableCell>
                    <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                      <div>
                        <div className="font-medium line-clamp-1">
                          {review.title}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.comment}
                        </p>
                      </div>

                      {review.image && (
                        <Image
                          src={review.image}
                          alt="review"
                          width={120}
                          height={120}
                          className="rounded-xl border object-cover"
                        />
                      )}
                    </div>
                  </TableCell>

                  {/* REPLY */}
                  <TableCell>
                    <div className="space-y-3">
                      {review.adminReply?.message && (
                        <div className="rounded-xl border bg-primary/5 p-3 text-sm">
                          <div className="flex items-center gap-2 font-medium text-primary mb-1">
                            <MessageSquareReply className="size-4" />
                            {review.adminReply.repliedBy || "Admin"}
                          </div>
                          <p className="text-muted-foreground line-clamp-3">
                            {review.adminReply.message}
                          </p>
                        </div>
                      )}

                      <ReviewReplyForm
                        reviewId={review._id}
                        initialReply={review.adminReply}
                      />
                    </div>
                  </TableCell>

                  {/* ACTION */}
                  <TableCell className="text-right">
                    <DeleteDialog id={review._id} action={deleteReview} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {reviews.totalPages > 1 && (
          <div className="border-t p-4">
            <Pagination page={page} totalPages={reviews.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
  }
