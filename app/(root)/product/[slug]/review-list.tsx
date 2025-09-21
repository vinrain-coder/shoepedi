"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Check, StarIcon, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

import Rating from "@/components/shared/product/rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"; // Make sure you have a Drawer component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUpdateReview,
  getReviewByProductId,
  getReviews,
} from "@/lib/actions/review.actions";
import { ReviewInputSchema } from "@/lib/validator";
import RatingSummary from "@/components/shared/product/rating-summary";
import { IProduct } from "@/lib/db/models/product.model";
import { Separator } from "@/components/ui/separator";
import { IReviewDetails } from "@/types";
import { toast } from "sonner";
import { AutoResizeTextarea } from "@/components/shared/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};

export default function ReviewList({
  userId,
  product,
}: {
  userId: string | undefined;
  product: IProduct;
}) {
  const isMobile = useIsMobile();

  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(0);
  const [reviews, setReviews] = useState<IReviewDetails[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true });
  const [loadingReviews, setLoadingReviews] = useState(false);

  const reload = async () => {
    try {
      const res = await getReviews({
        productId: product._id.toString(),
        page: 1,
      });
      setReviews([...res.data]);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast.error("Error fetching reviews");
    }
  };

  const loadMoreReviews = async () => {
    if (totalPages !== 0 && page > totalPages) return;
    setLoadingReviews(true);
    const res = await getReviews({ productId: product._id.toString(), page });
    setLoadingReviews(false);
    setReviews([...reviews, ...res.data]);
    setTotalPages(res.totalPages);
    setPage(page + 1);
  };

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true);
      const res = await getReviews({
        productId: product._id.toString(),
        page: 1,
      });
      setReviews([...res.data]);
      setTotalPages(res.totalPages);
      setLoadingReviews(false);
    };

    if (inView) {
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  type CustomerReview = z.infer<typeof ReviewInputSchema>;
  const form = useForm<CustomerReview>({
    resolver: zodResolver(ReviewInputSchema),
    defaultValues: reviewFormDefaultValues,
  });
  const [open, setOpen] = useState(false);

  const onSubmit: SubmitHandler<CustomerReview> = async (values) => {
    const res = await createUpdateReview({
      data: { ...values, product: product._id.toString() },
      path: `/product/${product.slug}`,
    });
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setOpen(false);
    reload();
    toast.success(res.message);
  };

  const handleOpenForm = async () => {
    // Open right away
    setOpen(true);

    // Set initial values (product, user, etc.)
    form.setValue("product", product._id.toString());
    form.setValue("user", userId!);
    form.setValue("isVerifiedPurchase", true);

    // Then fetch existing review asynchronously
    try {
      const review = await getReviewByProductId({
        productId: product._id.toString(),
      });
      if (review) {
        form.setValue("title", review.title);
        form.setValue("comment", review.comment);
        form.setValue("rating", review.rating);
      }
    } catch (err) {
      console.error("Error loading review:", err);
    }
  };

  const ReviewFormContent = () => (
    <Form {...form}>
      <form
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <AutoResizeTextarea placeholder="Enter comment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        <div className="flex items-center gap-1">
                          {index + 1}
                          <StarIcon className="h-4 w-4" />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="space-y-2">
      {reviews.length === 0 && <div>No reviews yet</div>}

      <div
        className={
          isMobile
            ? "flex flex-col gap-6"
            : "grid grid-cols-1 md:grid-cols-4 gap-8"
        }
      >
        {/* Left column (summary + form) */}
        <div className="flex flex-col gap-2">
          {reviews.length !== 0 && (
            <RatingSummary
              avgRating={product.avgRating}
              numReviews={product.numReviews}
              ratingDistribution={product.ratingDistribution}
            />
          )}
          <Separator className="my-3" />
          <div className="space-y-3">
            <h3 className="font-bold text-lg lg:text-xl">
              Review this product
            </h3>
            <p className="text-sm">
              {isMobile
                ? "Share your thoughts"
                : "Share your thoughts with other customers"}
            </p>
            {userId ? (
              <>
                <Button
                  onClick={handleOpenForm}
                  variant="outline"
                  className="rounded-full w-full"
                  size={isMobile ? "sm" : "default"}
                >
                  Write a review
                </Button>

                {isMobile ? (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerContent className="w-full max-w-none p-4 flex flex-col gap-4">
                      <DrawerHeader className="pb-2">
                        <DrawerTitle className="text-lg font-bold">
                          Review
                        </DrawerTitle>
                      </DrawerHeader>

                      <div className="flex-1">
                        <ReviewFormContent />
                      </div>

                      <DrawerFooter className="pt-2" />
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px] p-6 flex flex-col gap-4">
                      <DialogHeader className="pb-2">
                        <DialogTitle className="text-lg font-bold">
                          Write a customer review
                        </DialogTitle>
                      </DialogHeader>

                      <div className="flex-1">
                        <ReviewFormContent />
                      </div>

                      <DialogFooter className="pt-2" />
                    </DialogContent>
                  </Dialog>
                )}
              </>
            ) : (
              <div className="mt-4 text-md text-muted-foreground">
                Please{" "}
                <Link
                  href={`/sign-in?callbackUrl=/product/${product.slug}`}
                  className="text-primary font-medium underline hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>{" "}
                to write a review.
              </div>
            )}
          </div>
        </div>

        {/* Right column (reviews) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {reviews.map((review: IReviewDetails) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex-between">
                  <CardTitle className={isMobile ? "text-base" : ""}>
                    {review.title}
                  </CardTitle>
                  {!isMobile && (
                    <div className="italic text-sm flex">
                      <Check className="size-4" /> Verified Purchase
                    </div>
                  )}
                </div>
                <CardDescription>{review.comment}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`flex flex-wrap gap-3 text-sm text-muted-foreground ${
                    isMobile ? "text-xs" : ""
                  }`}
                >
                  <Rating rating={review.rating} />
                  <div className="flex items-center">
                    <User className="mr-1 size-4" />
                    {review.user ? review.user.name : "Deleted User"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 size-4" />
                    {review.createdAt.toString().substring(0, 10)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div ref={ref} className="text-center">
            {page <= totalPages && (
              <Button
                variant="link"
                onClick={loadMoreReviews}
                size={isMobile ? "sm" : "default"}
              >
                See more reviews
              </Button>
            )}
            {page < totalPages && loadingReviews && "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
}
