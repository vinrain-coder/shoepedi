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
    <div className="space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Reviews</h1>
        <p className="text-xs text-muted-foreground">
          Manage customer feedback and replies
        </p>
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px] text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {(reviews.data as AdminReviewRow[]).map((review) => (
                <TableRow key={review._id} className="align-top">
                  
                  {/* ID */}
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {formatId(review._id)}
                  </TableCell>

                  {/* DATE */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(review.createdAt!).dateTime}
                  </TableCell>

                  {/* PRODUCT */}
                  <TableCell>
                    <div className="flex gap-2">
                      {review.product?.images?.[0] && (
                        <Image
                          src={review.product.images[0]}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-md border object-cover"
                        />
                      )}
                      <div className="space-y-0.5">
                        <Link
                          href={`/product/${review.product?.slug}`}
                          className="text-sm font-medium hover:underline line-clamp-1"
                        >
                          {review.product?.name || "Deleted"}
                        </Link>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {review.isVerifiedPurchase ? "Verified" : "Feedback"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell>
                    <div className="text-xs">
                      <div className="font-medium">
                        {review.user?.name || "Deleted"}
                      </div>
                      <div className="text-muted-foreground truncate max-w-[140px]">
                        {review.user?.email || "—"}
                      </div>
                    </div>
                  </TableCell>

                  {/* RATING */}
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="size-4 fill-primary text-primary" />
                      {review.rating}
                    </div>
                  </TableCell>

                  {/* REVIEW */}
                  <TableCell>
                    <div className="space-y-1 max-w-[300px]">
                      <div className="font-medium text-sm line-clamp-1">
                        {review.title}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>

                      {review.image && (
                        <Image
                          src={review.image}
                          alt=""
                          width={80}
                          height={80}
                          className="rounded-md border mt-1"
                        />
                      )}
                    </div>
                  </TableCell>

                  {/* REPLY */}
                  <TableCell>
                    <div className="space-y-2 min-w-[220px]">
                      {review.adminReply?.message && (
                        <div className="text-xs border-l-2 pl-2 text-muted-foreground">
                          <span className="font-medium text-primary">
                            {review.adminReply.repliedBy || "Admin"}:
                          </span>{" "}
                          {review.adminReply.message}
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

        {reviews.totalPages > 1 && (
          <div className="border-t p-3">
            <Pagination page={page} totalPages={reviews.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
  }
