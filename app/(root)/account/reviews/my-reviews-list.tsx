"use client";

import DeleteDialog from "@/components/shared/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteReview } from "@/lib/actions/review.actions";
import { Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type ReviewItem = {
  _id: string;
  title: string;
  comment: string;
  rating: number;
  createdAt: string;
  product?: {
    name: string;
    slug: string;
  };
};

export default function MyReviewsList({ items }: { items: ReviewItem[] }) {
  const [reviews, setReviews] = useState(items);

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You haven&apos;t written any reviews yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <Card key={review._id}>
          <CardHeader className="flex-row items-start justify-between space-y-0 gap-4 pb-3">
            <div>
              <CardTitle className="text-base">{review.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {review.product ? (
                  <Link href={`/product/${review.product.slug}`} className="hover:underline">
                    {review.product.name}
                  </Link>
                ) : (
                  "Product unavailable"
                )}
              </p>
            </div>
            <DeleteDialog
              id={review._id}
              action={deleteReview}
              triggerLabel="Delete review"
              title="Delete this review?"
              description="This review will be permanently deleted from the product page."
              callbackAction={() => setReviews((prev) => prev.filter((item) => item._id !== review._id))}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                {review.rating}/5
              </Badge>
              <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
            {review.product?.slug ? (
              <Button asChild variant="link" className="h-auto p-0">
                <Link href={`/product/${review.product.slug}`}>View product</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
