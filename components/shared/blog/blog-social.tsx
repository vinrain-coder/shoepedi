"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Heart, Reply, Loader2 } from "lucide-react";
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
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
    <Avatar className="size-9">
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
    <button
      onClick={handleLike}
      disabled={isPending}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Heart className="size-3" />
      )}
      {likesCount}
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
    <div className="mt-10 max-w-3xl mx-auto space-y-6">
      {/* Post Social */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="size-4" />
            {likesCount}
          </span>

          <span className="flex items-center gap-1">
            <MessageCircle className="size-4" />
            {commentCount}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handlePostLike}
          disabled={isLikingPost}
        >
          {isLikingPost ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart className="size-4" />
          )}
          Like
        </Button>
      </div>

      {/* Comment Input */}
      <div className="space-y-3">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            session?.user.id
              ? "Write a comment..."
              : "Sign in to join the discussion"
          }
          disabled={!session?.user.id || isSubmitting}
          className="min-h-24"
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => submitComment(commentText)}
            disabled={!commentText.trim() || !session?.user.id || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageCircle className="size-4" />
            )}
            Comment
          </Button>
        </div>
      </div>

      <Separator />

      {/* Comments */}
      <div className="space-y-6">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No comments yet. Start the conversation.
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment._id} className="space-y-3">
            <div className="flex gap-3">
              <UserAvatar name={comment.userName} image={comment.userImage} />

              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(comment.createdAt)}
                  </span>
                </div>

                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 mt-2">
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
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setActiveReplyId(
                        activeReplyId === comment._id ? null : comment._id
                      )
                    }
                  >
                    <Reply className="size-3" />
                    Reply
                  </button>
                </div>
              </div>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="ml-12 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <UserAvatar
                      name={reply.userName}
                      image={reply.userImage}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{reply.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(reply.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {reply.content}
                      </p>

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
                ))}
              </div>
            )}

            {/* Reply Box */}
            {activeReplyId === comment._id && (
              <div className="ml-12 space-y-2">
                <Textarea
                  value={replyDrafts[comment._id] || ""}
                  onChange={(e) =>
                    setReplyDrafts((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  placeholder={`Reply to ${comment.userName}`}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveReplyId(null)}
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
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Reply className="size-4" />
                    )}
                    Reply
                  </Button>
                </div>
              </div>
            )}

            <Separator />
          </div>
        ))}
      </div>
    </div>
  );
  }
