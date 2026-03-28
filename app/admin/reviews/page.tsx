import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
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
          Manage feedback & replies
        </p>
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full table-fixed text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">ID</TableHead>
                <TableHead className="w-[110px]">Date</TableHead>
                <TableHead className="w-[180px]">Product</TableHead>
                <TableHead className="w-[140px]">Customer</TableHead>
                <TableHead className="w-[70px]">Rating</TableHead>
                <TableHead className="w-[220px]">Review</TableHead>
                <TableHead className="w-[200px]">Reply</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {(reviews.data as AdminReviewRow[]).map((review) => (
                <TableRow key={review._id} className="align-top">
                  
                  {/* ID */}
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {formatId(review._id)}
                  </TableCell>

                  {/* DATE */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(review.createdAt!).dateTime}
                  </TableCell>

                  {/* PRODUCT */}
                  <TableCell>
                    <div className="flex gap-2 w-full overflow-hidden">
                      {review.product?.images?.[0] && (
                        <Image
                          src={review.product.images[0]}
                          alt=""
                          width={32}
                          height={32}
                          className="rounded border shrink-0 object-cover"
                        />
                      )}

                      <div className="min-w-0 overflow-hidden">
                        <Link
                          href={`/product/${review.product?.slug}`}
                          className="text-sm font-medium truncate block"
                        >
                          {review.product?.name || "Deleted"}
                        </Link>

                        <Badge className="text-[10px] mt-1 px-1 py-0">
                          {review.isVerifiedPurchase ? "Verified" : "Feedback"}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell>
                    <div className="text-xs overflow-hidden">
                      <p className="font-medium truncate">
                        {review.user?.name || "Deleted"}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {review.user?.email || "—"}
                      </p>
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
                    <div className="w-full overflow-hidden">
                      <p className="text-sm font-medium truncate">
                        {review.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {review.comment}
                      </p>

                      {review.image && (
                        <Image
                          src={review.image}
                          alt=""
                          width={60}
                          height={60}
                          className="rounded border mt-1"
                        />
                      )}
                    </div>
                  </TableCell>

                  {/* REPLY */}
                  <TableCell>
                    <div className="w-full overflow-hidden space-y-1">
                      {review.adminReply?.message && (
                        <p className="text-xs truncate">
                          <span className="font-medium text-primary">
                            {review.adminReply.repliedBy || "Admin"}:
                          </span>{" "}
                          {review.adminReply.message}
                        </p>
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
          <div className="border-t p-3">
            <Pagination page={page} totalPages={reviews.totalPages} />
          </div>
        )}
      </div>
    </div>
  );
        }
