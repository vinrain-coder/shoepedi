"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Heart, Reply, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { createBlogComment, toggleBlogCommentLike, toggleBlogLike } from "@/lib/actions/blog.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface BlogReply {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

interface BlogComment extends BlogReply {
  replies: BlogReply[];
}

function getGuestId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem("shoepedi-blog-guest-id");
  if (existing) return existing;
  const guestId = crypto.randomUUID();
  window.localStorage.setItem("shoepedi-blog-guest-id", guestId);
  return guestId;
}

function formatRelativeDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UserAvatar({ name, image }: { name: string; image?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="size-10 border bg-background">
      <AvatarImage src={image} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

function CommentLikeButton({
  blogId,
  commentId,
  replyId,
  likesCount,
  onUpdate,
}: {
  blogId: string;
  commentId: string;
  replyId?: string;
  likesCount: number;
  onUpdate: (likesCount: number) => void;
}) {
  const { data: session } = authClient.useSession();
  const [isPending, setIsPending] = useState(false);

  const handleLike = async () => {
    setIsPending(true);
    const response = await toggleBlogCommentLike({
      blogId,
      commentId,
      replyId,
      userId: session?.user.id,
      guestId: session?.user.id ? undefined : getGuestId(),
    });
    setIsPending(false);

    if (!response.success) {
      toast.error(response.message || "Unable to update like");
      return;
    }

    onUpdate(response.likesCount ?? likesCount);
  };

  return (
    <Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground" onClick={handleLike} disabled={isPending}>
      {isPending ? <Loader2 className="size-3 animate-spin" /> : <Heart className="size-3" />}
      {likesCount} likes
    </Button>
  );
}

export default function BlogSocial({
  blogId,
  slug,
  initialLikesCount,
  initialComments,
}: {
  blogId: string;
  slug: string;
  initialLikesCount: number;
  initialComments: BlogComment[];
}) {
  const { data: session } = authClient.useSession();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isLikingPost, setIsLikingPost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentCount = useMemo(
    () => comments.reduce((total, comment) => total + 1 + comment.replies.length, 0),
    [comments]
  );

  const handlePostLike = async () => {
    setIsLikingPost(true);
    const response = await toggleBlogLike({
      blogId,
      userId: session?.user.id,
      guestId: session?.user.id ? undefined : getGuestId(),
    });
    setIsLikingPost(false);

    if (!response.success) {
      toast.error(response.message || "Unable to update blog like");
      return;
    }

    setLikesCount(response.likesCount ?? likesCount);
  };

  const submitComment = async (content: string, parentCommentId?: string) => {
    if (!session?.user.id) {
      toast.error("Please sign in to join the conversation");
      return;
    }

    setIsSubmitting(true);
    const response = await createBlogComment({ blogId, content, parentCommentId });
    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || "Unable to submit comment");
      return;
    }

    const refreshed = await fetch(`/api/blogs/${slug}`, { cache: "no-store" }).then((res) => res.json());
    setComments(refreshed.comments || []);
    setLikesCount(refreshed.likesCount || likesCount);
    setCommentText("");
    setReplyDrafts({});
    setActiveReplyId(null);
    toast.success(response.message);
  };

  return (
    <div className="mt-8 space-y-6">
      <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Community pulse</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-sm"><Heart className="size-4 text-rose-500" /> {likesCount} likes</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow-sm"><MessageCircle className="size-4 text-sky-500" /> {commentCount} comments</span>
            </div>
          </div>
          <Button onClick={handlePostLike} disabled={isLikingPost} className="sm:min-w-36">
            {isLikingPost ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
            Like this post
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-semibold">Comments</h2>
          <p className="text-sm text-muted-foreground">Join the discussion, ask questions, and reply to other readers.</p>
        </div>

        <Card>
          <CardContent className="space-y-3 p-4">
            <Textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={session?.user.id ? "Share your thoughts about this article..." : "Sign in to leave a comment"}
              disabled={!session?.user.id || isSubmitting}
              className="min-h-28"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {session?.user.id ? "Replies are enabled for signed-in readers." : "Only logged-in users can comment or reply."}
              </p>
              <Button onClick={() => submitComment(commentText)} disabled={!session?.user.id || !commentText.trim() || isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />} Post comment
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">No comments yet. Be the first to start the conversation.</CardContent>
            </Card>
          ) : (
            comments.map((comment, commentIndex) => (
              <Card key={comment._id} className="border-border/70">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex gap-3">
                    <UserAvatar name={comment.userName} image={comment.userImage} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold">{comment.userName}</p>
                        <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{commentIndex + 1}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{comment.content}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4">
                        <CommentLikeButton
                          blogId={blogId}
                          commentId={comment._id}
                          likesCount={comment.likesCount}
                          onUpdate={(updatedLikesCount) => {
                            setComments((current) => current.map((item) => item._id === comment._id ? { ...item, likesCount: updatedLikesCount } : item));
                          }}
                        />
                        <Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground" onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}>
                          <Reply className="size-3" /> Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  {comment.replies.length > 0 && (
                    <div className="space-y-3 rounded-2xl bg-muted/40 p-3 sm:ml-12">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3 rounded-xl bg-background p-3 shadow-sm">
                          <UserAvatar name={reply.userName} image={reply.userImage} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="font-semibold text-sm">{reply.userName}</p>
                              <span className="text-xs text-muted-foreground">{formatRelativeDate(reply.createdAt)}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{reply.content}</p>
                            <CommentLikeButton
                              blogId={blogId}
                              commentId={comment._id}
                              replyId={reply._id}
                              likesCount={reply.likesCount}
                              onUpdate={(updatedLikesCount) => {
                                setComments((current) => current.map((item) => item._id !== comment._id ? item : { ...item, replies: item.replies.map((itemReply) => itemReply._id === reply._id ? { ...itemReply, likesCount: updatedLikesCount } : itemReply) }));
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeReplyId === comment._id && (
                    <div className="space-y-3 rounded-2xl border border-dashed p-3 sm:ml-12">
                      <Textarea
                        value={replyDrafts[comment._id] || ""}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [comment._id]: event.target.value }))}
                        placeholder={session?.user.id ? `Reply to ${comment.userName}...` : "Sign in to reply"}
                        disabled={!session?.user.id || isSubmitting}
                        className="min-h-24"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                        <Button onClick={() => submitComment(replyDrafts[comment._id] || "", comment._id)} disabled={!session?.user.id || !(replyDrafts[comment._id] || "").trim() || isSubmitting}>
                          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Reply className="size-4" />} Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
