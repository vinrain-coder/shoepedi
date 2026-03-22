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
  CornerDownRight,
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

/* ---------------- FORM ---------------- */

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
    <div className="space-y-4">
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
          <FormItem>
            <FormLabel>Rating</FormLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    <div className="flex items-center gap-1">
                      {i + 1}
                      <StarIcon className="size-3 fill-primary text-primary" />
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
              <AutoResizeTextarea
                className="min-h-24"
                placeholder="Share your experience..."
                {...field}
              />
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

/* ---------------- MAIN ---------------- */

export default function ReviewList({ product }: { product: IProduct }) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(2);
  const [totalPages, setTotalPages] = useState(0);
  const [reviews, setReviews] = useState<IReviewDetails[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<CustomerReview>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: reviewFormDefaultValues,
  });

  const reload = async () => {
    const res = await getReviews({
      productId: product._id.toString(),
      page: 1,
    });
    setReviews(res.data);
    setTotalPages(res.totalPages);
    setPage(2);
  };

  const onSubmit: SubmitHandler<CustomerReview> = async (values) => {
    const res = await submitReviewAction(
      { ...values, product: product._id.toString() },
      `/product/${product.slug}`
    );

    if (!res.success) return toast.error(res.message);

    form.reset(reviewFormDefaultValues);
    setOpen(false);
    reload();
    toast.success(res.message);
  };

  const reviewForm = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          <ReviewFormFields form={form} />
        </div>

        {/* FIXED FOOTER */}
        <div className="border-t p-4">
          <Button type="submit" className="w-full rounded-full">
            Submit review
          </Button>
        </div>
      </form>
    </Form>
  );

  const { data: session } = authClient.useSession();
  const userId = session?.user.id;

  return (
    <div className="space-y-5">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* LEFT PANEL */}
        <div className="lg:col-span-1">
          <Card className="p-4 space-y-4">
            <RatingSummary
              avgRating={product.avgRating}
              numReviews={product.numReviews}
              ratingDistribution={product.ratingDistribution}
            />

            {userId ? (
              isMobile ? (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger asChild>
                    <Button className="w-full">Write review</Button>
                  </DrawerTrigger>

                  <DrawerContent className="h-[90vh] flex flex-col">
                    <DrawerHeader>
                      <DrawerTitle>Write review</DrawerTitle>
                      <DrawerDescription>
                        Share your experience
                      </DrawerDescription>
                    </DrawerHeader>

                    {reviewForm}
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Write review</Button>
                  </DialogTrigger>

                  <DialogContent>{reviewForm}</DialogContent>
                </Dialog>
              )
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Sign in to review
                </Button>
              </Link>
            )}
          </Card>
        </div>

        {/* REVIEWS */}
        <div className="space-y-3 lg:col-span-3">
          {reviews.map((review) => (
            <Card key={review._id} className="p-4 space-y-3">
              <div className="flex justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-medium text-sm">{review.title}</h3>
                  <Rating rating={review.rating} size={14} />
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <User className="size-3" />
                    {review.user?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* IMAGE */}
              {review.image && (
                <div className="rounded-lg overflow-hidden border">
                  <Image
                    src={review.image}
                    alt=""
                    width={800}
                    height={600}
                    className="h-[220px] w-full object-cover"
                  />
                </div>
              )}

              {/* ADMIN REPLY */}
              {review.adminReply?.message && (
                <div className="flex gap-2 bg-muted/40 p-3 rounded-lg border">
                  <CornerDownRight className="size-4 mt-1 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      Admin reply
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.adminReply.message}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}

          <div ref={ref} />
        </div>
      </div>
    </div>
  );
  }
