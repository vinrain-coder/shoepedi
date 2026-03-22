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
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="h1-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          Moderate customer feedback, preview uploaded photos, and publish admin replies.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Reply</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(reviews.data as AdminReviewRow[]).map((review) => (
              <TableRow key={review._id} className="align-top">
                <TableCell className="font-medium">{formatId(review._id)}</TableCell>
                <TableCell>{formatDateTime(review.createdAt!).dateTime}</TableCell>
                <TableCell>
                  <div className="flex min-w-60 gap-3">
                    {review.product?.images?.length > 0 ? (
                      <Image
                        src={review.product.images[0]}
                        alt={review.product.name}
                        width={64}
                        height={64}
                        className="size-16 rounded-2xl border object-cover"
                      />
                    ) : null}
                    <div className="space-y-1">
                      {review.product ? (
                        <Link
                          href={`/product/${review.product.slug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {review.product.name}
                        </Link>
                      ) : (
                        <span>Deleted product</span>
                      )}
                      <div>
                        <Badge variant="outline" className="rounded-full">
                          {review.isVerifiedPurchase ? "Verified purchase" : "Customer feedback"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="font-medium">{review.user?.name || "Deleted user"}</div>
                    <div className="text-muted-foreground">{review.user?.email || "—"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="size-4 fill-primary text-primary" />
                    {review.rating}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="min-w-80 space-y-3 rounded-2xl bg-muted/20 p-4">
                    <div>
                      <div className="font-medium">{review.title}</div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                    {review.image ? (
                      <Image
                        src={review.image}
                        alt={`Review photo for ${review.product?.name || "product"}`}
                        width={500}
                        height={360}
                        className="h-32 w-32 rounded-2xl border object-cover"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-3">
                    {review.adminReply?.message ? (
                      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm">
                        <div className="mb-1 flex items-center gap-2 font-medium text-primary">
                          <MessageSquareReply className="size-4" />
                          {review.adminReply.repliedBy || "Admin"}
                        </div>
                        <p className="leading-6 text-foreground/80">{review.adminReply.message}</p>
                      </div>
                    ) : null}
                    <ReviewReplyForm reviewId={review._id} initialReply={review.adminReply} />
                  </div>
                </TableCell>
                <TableCell>
                  <DeleteDialog id={review._id} action={deleteReview} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reviews.totalPages > 1 ? <Pagination page={page} totalPages={reviews.totalPages} /> : null}
      </div>
    </div>
  );
}
