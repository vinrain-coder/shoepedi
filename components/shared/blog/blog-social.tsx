"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Heart, Reply, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  createBlogComment,
  toggleBlogCommentLike,
  toggleBlogLike,
} from "@/lib/actions/blog.actions";
import { Button } from "@/components/ui/button";
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
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: new Date(date).getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function UserAvatar({ name, image }: { name: string; image?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="size-8">
      <AvatarImage src={image} alt={name} />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
    <button
      onClick={handleLike}
      disabled={isPending}
      className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Heart className="size-3.5 group-hover:fill-current transition-all" />
      )}
      <span className="font-medium">{likesCount}</span>
    </button>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLikingPost, setIsLikingPost] = useState(false);

  const commentCount = useMemo(
    () =>
      comments.reduce(
        (total, comment) => total + 1 + comment.replies.length,
        0
      ),
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

    const response = await createBlogComment({
      blogId,
      content,
      parentCommentId,
    });

    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || "Unable to submit comment");
      return;
    }

    const refreshed = await fetch(`/api/blogs/${slug}`, {
      cache: "no-store",
    }).then((res) => res.json());

    setComments(refreshed.comments || []);
    setLikesCount(refreshed.likesCount || likesCount);

    setCommentText("");
    setReplyDrafts({});
    setActiveReplyId(null);

    toast.success(response.message);
  };

  return (
    <div className="mt-12 max-w-2xl mx-auto space-y-8">
      {/* Post Social Stats */}
      <div className="flex items-center justify-between py-3 border-y">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <button
            onClick={handlePostLike}
            disabled={isLikingPost}
            className="group flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            {isLikingPost ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className="size-4 group-hover:fill-current transition-all" />
            )}
            <span className="font-medium">{likesCount}</span>
          </button>

          <span className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            <span className="font-medium">{commentCount}</span>
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-3">
        <div className="flex gap-3 items-start">
          {session?.user && (
            <UserAvatar 
              name={session.user.name || "User"} 
              image={session.user.image} 
            />
          )}
          <div className="flex-1 space-y-3">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                session?.user.id
                  ? "Share your thoughts..."
                  : "Sign in to join the discussion"
              }
              disabled={!session?.user.id || isSubmitting}
              className="min-h-20 resize-none border-muted-foreground/20 focus-visible:ring-1"
            />

            {session?.user.id && commentText.trim() && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => submitComment(commentText)}
                  disabled={!commentText.trim() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.length === 0 && (
          <p className="text-center py-12 text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts.
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment._id} className="space-y-4">
            <div className="flex gap-3">
              <UserAvatar name={comment.userName} image={comment.userImage} />

              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(comment.createdAt)}
                  </span>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 pt-1">
                  <CommentLikeButton
                    blogId={blogId}
                    commentId={comment._id}
                    likesCount={comment.likesCount}
                    onUpdate={(likes) =>
                      setComments((prev) =>
                        prev.map((c) =>
                          c._id === comment._id
                            ? { ...c, likesCount: likes }
                            : c
                        )
                      )
                    }
                  />

                  <button
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() =>
                      setActiveReplyId(
                        activeReplyId === comment._id ? null : comment._id
                      )
                    }
                  >
                    <Reply className="size-3.5" />
                    <span className="font-medium">Reply</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-11 space-y-4 border-l-2 border-muted pl-4">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <UserAvatar
                      name={reply.userName}
                      image={reply.userImage}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{reply.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(reply.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {reply.content}
                      </p>

                      <div className="pt-1">
                        <CommentLikeButton
                          blogId={blogId}
                          commentId={comment._id}
                          replyId={reply._id}
                          likesCount={reply.likesCount}
                          onUpdate={(likes) =>
                            setComments((prev) =>
                              prev.map((c) =>
                                c._id !== comment._id
                                  ? c
                                  : {
                                      ...c,
                                      replies: c.replies.map((r) =>
                                        r._id === reply._id
                                          ? { ...r, likesCount: likes }
                                          : r
                                      ),
                                    }
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
            {activeReplyId === comment._id && (
              <div className="ml-11 space-y-2 border-l-2 border-muted pl-4">
                <Textarea
                  value={replyDrafts[comment._id] || ""}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  placeholder={`Reply to ${comment.userName}...`}
                  className="min-h-16 resize-none text-sm border-muted-foreground/20 focus-visible:ring-1"
                  autoFocus
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveReplyId(null);
                      setReplyDrafts((prev) => {
                        const updated = { ...prev };
                        delete updated[comment._id];
                        return updated;
                      });
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      submitComment(
                        replyDrafts[comment._id] || "",
                        comment._id
                      )
                    }
                    disabled={
                      !(replyDrafts[comment._id] || "").trim() || isSubmitting
                    }
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Reply
                  </Button>
                </div>
              </div>
            )}

            {comment !== comments[comments.length - 1] && (
              <Separator className="!mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
