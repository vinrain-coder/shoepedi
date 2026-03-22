"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CheckCircle2,
  ImageIcon,
  MessageSquareQuote,
  ShieldCheck,
  StarIcon,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, UseFormReturn, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

import Rating from "@/components/shared/product/rating";
import ReviewImageUploader from "@/components/shared/review-image-uploader";
import { AutoResizeTextarea } from "@/components/shared/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RatingSummary from "@/components/shared/product/rating-summary";
import { authClient } from "@/lib/auth-client";
import { getReviews, submitReviewAction } from "@/lib/actions/review.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { ReviewInputSchema } from "@/lib/validator";
import { IReviewDetails } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const ReviewFormSchema = ReviewInputSchema.omit({
  product: true,
  user: true,
});

const reviewFormDefaultValues = {
  title: "",
  comment: "",
  image: "",
  rating: 5,
  isVerifiedPurchase: false,
};

type CustomerReview = z.infer<typeof ReviewFormSchema>;

function ReviewFormFields({ form }: { form: UseFormReturn<CustomerReview> }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Summarize your experience" {...field} />
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
                onValueChange={(val) => field.onChange(Number(val))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <StarIcon className="size-4 fill-primary text-primary" />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-2xl border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="size-4 text-primary" />
            Optional image
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a photo to show fit, color, or packaging details.
          </p>
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <AutoResizeTextarea
                  placeholder="What did you like? How was the fit, comfort, and finish?"
                  className="min-h-28 rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormControl>
                <ReviewImageUploader value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

export default function ReviewList({ product }: { product: IProduct }) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(0);
  const [reviews, setReviews] = useState<IReviewDetails[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [open, setOpen] = useState(false);

  const reload = async () => {
    try {
      const res = await getReviews({ productId: product._id.toString(), page: 1 });
      setReviews([...res.data]);
      setTotalPages(res.totalPages);
      setPage(2);
    } catch {
      toast.error("Error fetching reviews");
    }
  };

  const loadMoreReviews = async () => {
    if (loadingReviews || (totalPages !== 0 && page > totalPages)) return;
    setLoadingReviews(true);
    const res = await getReviews({ productId: product._id.toString(), page });
    setLoadingReviews(false);
    setReviews((current) => [...current, ...res.data]);
    setTotalPages(res.totalPages);
    setPage((current) => current + 1);
  };

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true);
      const res = await getReviews({ productId: product._id.toString(), page: 1 });
      setReviews([...res.data]);
      setTotalPages(res.totalPages);
      setLoadingReviews(false);
    };

    if (inView) {
      loadReviews();
    }
  }, [inView, product._id]);

  const form = useForm<CustomerReview>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: reviewFormDefaultValues,
  });

  const onSubmit: SubmitHandler<CustomerReview> = async (values) => {
    const res = await submitReviewAction(
      { ...values, product: product._id.toString() },
      `/product/${product.slug}`
    );

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    form.reset(reviewFormDefaultValues);
    setOpen(false);
    reload();
    toast.success(res.message);
  };

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const reviewForm = (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ReviewFormFields form={form} />
        <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
          Your review may be shown publicly after moderation. Honest fit and quality notes help other shoppers.
        </div>
        {isMobile ? (
          <DrawerFooter className="px-0 pb-0">
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit review"}
            </Button>
          </DrawerFooter>
        ) : (
          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit review"}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="space-y-5 lg:col-span-1">
          <Card className="border-none bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
            <CardContent className="space-y-5 p-6">
              {reviews.length !== 0 ? (
                <RatingSummary
                  avgRating={product.avgRating}
                  numReviews={product.numReviews}
                  ratingDistribution={product.ratingDistribution}
                />
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    New product feedback
                  </Badge>
                  <h3 className="text-xl font-semibold">Be the first to review</h3>
                  <p className="text-sm text-muted-foreground">
                    Share what stood out about comfort, fit, support, and style.
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Review this product</h3>
                <p className="text-sm text-muted-foreground">
                  Tell other shoppers what you noticed after unboxing and wearing it.
                </p>
                {userId ? (
                  isMobile ? (
                    <Drawer open={open} onOpenChange={setOpen}>
                      <DrawerTrigger asChild>
                        <Button className="w-full rounded-full">Write a review</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Write a customer review</DrawerTitle>
                          <DrawerDescription>
                            Share details about fit, comfort, and finish.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 pb-4">{reviewForm}</div>
                      </DrawerContent>
                    </Drawer>
                  ) : (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-full">Write a review</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl rounded-3xl">
                        <DialogHeader>
                          <DialogTitle>Write a customer review</DialogTitle>
                          <DialogDescription>
                            Share details about fit, comfort, and finish.
                          </DialogDescription>
                        </DialogHeader>
                        {reviewForm}
                      </DialogContent>
                    </Dialog>
                  )
                ) : (
                  <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                    Please{" "}
                    <Link
                      href={`/sign-in?callbackUrl=/product/${product.slug}`}
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      sign in
                    </Link>{" "}
                    to write a review.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-3">
          {reviews.length === 0 && !loadingReviews ? (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <MessageSquareQuote className="size-10 text-primary/70" />
                <div>
                  <h3 className="text-lg font-semibold">No reviews yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Customer feedback will appear here once shoppers start sharing their experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {reviews.map((review) => (
            <Card key={review._id} className="overflow-hidden border-primary/10 shadow-sm">
              <CardHeader className="gap-4 bg-gradient-to-r from-primary/[0.04] via-background to-background">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-lg">{review.title}</CardTitle>
                      {review.isVerifiedPurchase ? (
                        <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                          <ShieldCheck className="size-3.5" />
                          Verified purchase
                        </Badge>
                      ) : null}
                    </div>
                    <Rating rating={review.rating} size={16} />
                    <CardDescription className="max-w-3xl text-sm leading-6 text-foreground/80">
                      {review.comment}
                    </CardDescription>
                  </div>
                  <div className="grid gap-2 rounded-2xl border bg-background/90 p-4 text-sm text-muted-foreground shadow-sm">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{review.user ? review.user.name : "Deleted user"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>
                        {review.createdAt
                          ? new Date(review.createdAt).toISOString().substring(0, 10)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {review.image ? (
                  <div className="overflow-hidden rounded-3xl border bg-muted/20 shadow-sm">
                    <Image
                      src={review.image}
                      alt={`Review photo for ${product.name}`}
                      width={1200}
                      height={900}
                      className="max-h-[420px] w-full object-cover"
                    />
                  </div>
                ) : null}

                {review.adminReply?.message ? (
                  <div className="rounded-3xl border border-primary/15 bg-primary/5 p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="size-4" />
                      Admin reply
                      {review.adminReply.repliedBy ? (
                        <span className="text-muted-foreground">• {review.adminReply.repliedBy}</span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-foreground/85">
                      {review.adminReply.message}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}

          <div ref={ref} className="text-center">
            {page <= totalPages ? (
              <Button variant="outline" onClick={loadMoreReviews} disabled={loadingReviews}>
                {loadingReviews ? "Loading..." : "See more reviews"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
