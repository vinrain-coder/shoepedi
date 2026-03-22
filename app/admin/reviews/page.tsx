import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareReply, Star } from "lucide-react";

import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
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
import ReviewReplyForm from "./review-reply-form";

export const metadata: Metadata = {
  title: "Admin Reviews",
};

type AdminReviewRow = IReviewDetails & {
  user?: { name?: string; email?: string };
  product?: { name?: string; slug?: string; images?: string[] };
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
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate customer feedback and respond professionally.
        </p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border bg-muted/10">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[90px]">Id</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[220px]">Product</TableHead>
              <TableHead className="w-[180px]">Customer</TableHead>
              <TableHead className="w-[80px]">Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="w-[260px]">Reply</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(reviews.data as AdminReviewRow[]).map((review) => (
              <TableRow
                key={review._id}
                className="align-top hover:bg-muted/30 transition"
              >
                {/* ID */}
                <TableCell className="text-xs font-medium text-muted-foreground">
                  {formatId(review._id)}
                </TableCell>

                {/* DATE */}
                <TableCell className="text-xs">
                  {formatDateTime(review.createdAt!).dateTime}
                </TableCell>

                {/* PRODUCT */}
                <TableCell>
                  <div className="flex gap-2">
                    {review.product?.images?.[0] && (
                      <Image
                        src={review.product.images[0]}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-lg border object-cover"
                      />
                    )}
                    <div className="space-y-1">
                      {review.product ? (
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {review.product.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Deleted product
                        </span>
                      )}

                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {review.isVerifiedPurchase
                          ? "Verified"
                          : "Feedback"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                {/* CUSTOMER */}
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {review.user?.name || "Deleted"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {review.user?.email || "—"}
                    </div>
                  </div>
                </TableCell>

                {/* RATING */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="size-3.5 fill-primary text-primary" />
                    {review.rating}
                  </div>
                </TableCell>

                {/* REVIEW */}
                <TableCell>
                  <div className="space-y-2 rounded-lg bg-muted/20 p-3">
                    <div className="text-sm font-medium">
                      {review.title}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {review.comment}
                    </p>

                    {review.image && (
                      <Image
                        src={review.image}
                        alt=""
                        width={120}
                        height={120}
                        className="rounded-md border object-cover"
                      />
                    )}
                  </div>
                </TableCell>

                {/* REPLY */}
                <TableCell>
                  <div className="space-y-2">
                    {review.adminReply?.message && (
                      <div className="flex gap-2 rounded-lg bg-primary/5 p-2 border border-primary/10">
                        <MessageSquareReply className="size-4 text-primary mt-1" />
                        <div>
                          <p className="text-xs font-medium text-primary">
                            {review.adminReply.repliedBy || "Admin"}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {review.adminReply.message}
                          </p>
                        </div>
                      </div>
                    )}

                    <ReviewReplyForm
                      reviewId={review._id}
                      initialReply={review.adminReply}
                    />
                  </div>
                </TableCell>

                {/* ACTION */}
                <TableCell>
                  <DeleteDialog id={review._id} action={deleteReview} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        {reviews.totalPages > 1 && (
          <div className="p-4">
            <Pagination page={page} totalPages={reviews.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
  }
