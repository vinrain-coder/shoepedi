import { Metadata } from "next";
import Image from "next/image";
import { Star, Search } from "lucide-react";
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
import {
  deleteReview,
  getAllReviews,
  getReviewStats,
} from "@/lib/actions/review.actions";
import { IReviewDetails } from "@/types";
import { getServerSession } from "@/lib/get-session";
import { formatDateTime, formatId } from "@/lib/utils";
import ReviewStatsCards from "./review-stats-cards";
import { ReviewsDateRangePicker } from "./date-range-picker";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import NextLink from "next/link";

export const metadata: Metadata = {
  title: "Admin Reviews",
};

type AdminReviewRow = IReviewDetails & {
  user?: { name?: string; email?: string };
  product?: { name?: string; slug?: string; images?: string[] };
};

export default async function ReviewsPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    rating?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const { query = "", rating = "all", from, to } = searchParams;

  const session = await getServerSession();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  const [reviews, stats] = await Promise.all([
    getAllReviews({
      page: Number(page),
      query,
      rating,
      from,
      to,
    }),
    getReviewStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Reviews</h1>
          <p className="text-muted-foreground">
            Monitor customer feedback and manage administrative replies
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/reviews" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search comments..."
              defaultValue={query}
              className="pl-9"
            />
            {rating !== "all" && (
              <input type="hidden" name="rating" value={rating} />
            )}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <ReviewsDateRangePicker />
        </div>
      </div>

      <ReviewStatsCards stats={stats} currentRating={rating} />

      <div className="rounded-md border bg-card overflow-hidden">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="w-30">Date</TableHead>
              <TableHead className="w-45">Product</TableHead>
              <TableHead className="w-37.5">Customer</TableHead>
              <TableHead className="w-20">Rating</TableHead>
              <TableHead className="w-62.5">Review</TableHead>
              <TableHead className="w-62.5">Reply</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reviews.data.length > 0 ? (
              (reviews.data as AdminReviewRow[]).map((review) => {
                const reviewImages =
                  review.images && review.images.length > 0
                    ? review.images
                    : review.image
                      ? [review.image]
                      : [];
                return (
                  <TableRow key={review._id} className="align-top">
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {formatId(review._id)}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(review.createdAt!).dateTime}
                    </TableCell>

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
                          {review.product?.slug ? (
                            <NextLink
                              href={`/product/${review.product.slug}`}
                              className="text-sm font-medium truncate block hover:underline"
                              target="_blank"
                            >
                              {review.product.name || "Deleted"}
                            </NextLink>
                          ) : (
                            <span className="text-sm font-medium truncate block">
                              {review.product?.name || "Deleted"}
                            </span>
                          )}

                          <Badge
                            variant={
                              review.isVerifiedPurchase
                                ? "success"
                                : "secondary"
                            }
                            className="text-[10px] mt-1 px-1 py-0"
                          >
                            {review.isVerifiedPurchase
                              ? "Verified"
                              : "Feedback"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

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

                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {review.rating}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="w-full overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {review.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {review.comment}
                        </p>

                        {reviewImages.length > 0 && (
                          <div className="mt-1 flex gap-1.5">
                            {reviewImages.slice(0, 2).map((imageUrl, index) => (
                              <Image
                                key={`${review._id}-${index}`}
                                src={imageUrl}
                                alt=""
                                width={40}
                                height={40}
                                className="rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="w-full overflow-hidden space-y-1">
                        {!!review.adminReply?.message?.trim() && (
                          <div className="p-2 bg-muted/50 rounded text-[11px]">
                            <span className="font-semibold text-primary block">
                              {review.adminReply.repliedBy || "Admin"}:
                            </span>
                            <p className="line-clamp-2">
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

                    <TableCell className="text-right">
                      <DeleteDialog id={review._id} action={deleteReview} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No reviews found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {reviews.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={reviews.totalPages} />
        </div>
      )}
    </div>
  );
}
