import Breadcrumb from "@/components/shared/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getMyReviews } from "@/lib/actions/review.actions";
import { Metadata } from "next";
import MyReviewsList from "./my-reviews-list";

export const metadata: Metadata = {
  title: "My Reviews",
};

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

export default async function AccountReviewsPage() {
  const result = await getMyReviews();

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div>
        <h1 className="h1-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your product reviews and remove any you no longer want to keep.</p>
      </div>

      {result.success ? (
        <MyReviewsList items={result.data as ReviewItem[]} />
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-red-500">{result.message || "Unable to load your reviews."}</CardContent>
        </Card>
      )}
    </div>
  );
}
