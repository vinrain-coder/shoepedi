"use client";

import DeleteDialog from "@/components/shared/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBlogComment } from "@/lib/actions/blog.actions";
import { MessageCircle, Reply } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export default function MyCommentsList({ items }: { items: CommentItem[] }) {
  const [comments, setComments] = useState(items);

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You haven&apos;t written any comments yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((item) => (
        <Card key={`${item.commentId}:${item.replyId || "root"}`}>
          <CardHeader className="flex-row items-start justify-between space-y-0 gap-4 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {item.type === "reply" ? <Reply className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                {item.type === "reply" ? "Reply" : "Comment"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                On{" "}
                <Link href={`/blogs/${item.blogSlug}`} className="hover:underline">
                  {item.blogTitle}
                </Link>
              </p>
            </div>
            <DeleteDialog
              id={`${item.commentId}-${item.replyId || "root"}`}
              onDelete={() =>
                deleteBlogComment({
                  blogId: item.blogId,
                  commentId: item.commentId,
                  replyId: item.replyId,
                })
              }
              triggerLabel={`Delete ${item.type}`}
              title={`Delete this ${item.type}?`}
              description="This action cannot be undone."
              callbackAction={() =>
                setComments((prev) =>
                  prev.filter(
                    (entry) =>
                      !(entry.blogId === item.blogId && entry.commentId === item.commentId && entry.replyId === item.replyId)
                  )
                )
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{item.likesCount} likes</Badge>
              <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
            <Button asChild variant="link" className="h-auto p-0">
              <Link href={`/blogs/${item.blogSlug}#comments`}>View discussion</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
