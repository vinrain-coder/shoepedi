import Breadcrumb from "@/components/shared/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { getMyBlogComments } from "@/lib/actions/blog.actions";
import { Metadata } from "next";
import MyCommentsList from "./my-comments-list";

export const metadata: Metadata = {
  title: "My Comments",
};

type CommentItem = {
  type: "comment" | "reply";
  blogId: string;
  blogTitle: string;
  blogSlug: string;
  commentId: string;
  replyId?: string;
  content: string;
  createdAt: string;
  likesCount: number;
};

export default async function AccountCommentsPage() {
  const result = await getMyBlogComments();

  return (
    <div className="space-y-4">
      <Breadcrumb />
      <div>
        <h1 className="h1-bold">My Comments</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your blog comments and replies in one place.</p>
      </div>

      {result.success ? (
        <MyCommentsList items={result.data as CommentItem[]} />
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-red-500">{result.message || "Unable to load your comments."}</CardContent>
        </Card>
      )}
    </div>
  );
}
