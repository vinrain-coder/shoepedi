"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  CheckCircle2,
  CornerDownRight,
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

import RatingSummary from "@/components/shared/product/rating-summary";
import ReviewImageUploader from "@/components/shared/review-image-uploader";
import { AutoResizeTextarea } from "@/components/shared/textarea";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
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
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
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
          <FormItem className="w-full">
            <FormLabel>Rating</FormLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    <div className="flex items-center gap-2">
                      {i + 1}
                      <StarIcon className="size-4 fill-primary text-primary" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comment</FormLabel>
            <FormControl>
              <AutoResizeTextarea {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <ReviewImageUploader value={field.value} onChange={field.onChange} />
        )}
      />
    </div>
  );
}

export default function ReviewList({ product }: { product: IProduct }) {
  const isMobile = useIsMobile();

  const [reviews, setReviews] = useState<IReviewDetails[]>([]);
  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [open, setOpen] = useState(false);

  const { ref, inView } = useInView({ triggerOnce: true });

  const form = useForm<CustomerReview>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: reviewFormDefaultValues,
  });

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  const loadInitial = async () => {
    setLoadingReviews(true);
    const res = await getReviews({
      productId: product._id.toString(),
      page: 1,
    });
    setReviews(res.data);
    setTotalPages(res.totalPages);
    setLoadingReviews(false);
  };

  useEffect(() => {
    if (inView) loadInitial();
  }, [inView]);

  const loadMore = async () => {
    if (loadingReviews || page > totalPages) return;
    setLoadingReviews(true);
    const res = await getReviews({
      productId: product._id.toString(),
      page,
    });
    setReviews((prev) => [...prev, ...res.data]);
    setPage((p) => p + 1);
    setLoadingReviews(false);
  };

  const onSubmit: SubmitHandler<CustomerReview> = async (values) => {
    const res = await submitReviewAction(
      { ...values, product: product._id.toString() },
      `/product/${product.slug}`
    );

    if (!res.success) return toast.error(res.message);

    toast.success(res.message);
    form.reset(reviewFormDefaultValues);
    setOpen(false);
    loadInitial();
  };

  const reviewForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ReviewFormFields form={form} />

        {isMobile ? (
          <DrawerFooter className="px-0">
            <Button className="w-full rounded-full" type="submit">
              Submit review
            </Button>
          </DrawerFooter>
        ) : (
          <DialogFooter>
            <Button className="w-full rounded-full" type="submit">
              Submit review
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  return (
    <div className="space-y-6">
      {/* LEFT PANEL */}
      <div className="grid gap-8 lg:grid-cols-4">
        <div>
          <Card>
            <CardContent className="space-y-5 p-6">
              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                ratingDistribution={product.ratingDistribution}
              />

              <Separator />

              {userId ? (
                isMobile ? (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                      <Button className="w-full rounded-full">Write review</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Write review</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 overflow-auto">{reviewForm}</div>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-full">Write review</Button>
                    </DialogTrigger>
                    <DialogContent>{reviewForm}</DialogContent>
                  </Dialog>
                )
              ) : (
                <Link href={`/sign-in`}>
                  <Button className="w-full rounded-full">Sign in to review</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-3 space-y-5">
          {reviews.length === 0 && !loadingReviews && (
            <p className="text-muted-foreground">No reviews yet</p>
          )}

          {/* 🔥 UPDATED LIST UI */}
          <div className="divide-y">
            {reviews.map((review) => (
              <div key={review._id} className="py-5 space-y-2">
                {/* stars + title */}
                <div className="flex items-center gap-2 flex-wrap">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`size-4 ${
                        i < review.rating
                          ? "fill-primary text-primary"
                          : "text-muted"
                      }`}
                    />
                  ))}
                  {review.title && (
                    <h3 className="font-semibold">{review.title}</h3>
                  )}
                  {review.isVerifiedPurchase && (
                    <Badge>Verified</Badge>
                  )}
                </div>

                {/* author */}
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="size-4" />
                  {review.user?.name || "Anonymous"} •
                  <Calendar className="size-4 ml-2" />
                  {review.createdAt &&
                    new Date(review.createdAt).toLocaleDateString()}
                </p>

                {/* comment */}
                <p className="whitespace-pre-line">{review.comment}</p>

                {/* image */}
                {review.image && (
                  <div className="mt-2">
                    <Image
                      src={review.image}
                      alt="review"
                      width={200}
                      height={200}
                      className="rounded-lg border object-cover max-h-40"
                    />
                  </div>
                )}

                {/* admin reply */}
                {review.adminReply?.message && (
                  <div className="ml-8 mt-3 border-t pt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CornerDownRight className="size-4" />
                      Admin
                    </div>
                    <p className="text-sm">
                      {review.adminReply.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {page <= totalPages && (
            <Button onClick={loadMore} disabled={loadingReviews}>
              {loadingReviews ? "Loading..." : "Load more"}
            </Button>
          )}
        </div>
      </div>

      <div ref={ref} />
    </div>
  );
}
