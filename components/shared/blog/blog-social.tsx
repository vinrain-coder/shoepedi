"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageCircle, Heart, Reply, Loader2, Send, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  createBlogComment,
  deleteBlogComment,
  editBlogComment,
  toggleBlogCommentLike,
  toggleBlogLike,
} from "@/lib/actions/blog.actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toSignInPath } from "@/lib/redirects";

interface BlogReply {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  likesCount: number;
  likedByUsers?: string[];
  likedByGuests?: string[];
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

function LikeButton({
  count,
  liked,
  pending,
  animate,
  onClick,
  size = "sm",
}: {
  count: number;
  liked: boolean;
  pending: boolean;
  animate?: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  const iconClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-rose-500"
    >
      {pending ? (
        <Loader2 className={`${iconClass} animate-spin`} />
      ) : (
        <Heart
          className={`${iconClass} transition-all duration-300 ${liked ? "fill-rose-500 text-rose-500" : "group-hover:fill-rose-200"} ${
            animate ? "scale-125" : "scale-100"
          }`}
        />
      )}
      <span className="font-medium">{count}</span>
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
  const [likedPost, setLikedPost] = useState(false);
  const [likeAnimKey, setLikeAnimKey] = useState<string | null>(null);
  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [editingTarget, setEditingTarget] = useState<{ commentId: string; replyId?: string } | null>(null);
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingKey, setIsDeletingKey] = useState<string | null>(null);

  const signInToCommentHref = toSignInPath(`/blogs/${slug}#comments`);

  const commentCount = useMemo(
    () => comments.reduce((total, comment) => total + 1 + comment.replies.length, 0),
    [comments]
  );

  const actorId = session?.user.id ?? getGuestId();

  const isLikedByActor = (item: { likedByUsers?: string[]; likedByGuests?: string[] }) => {
    if (session?.user.id) {
      return (item.likedByUsers || []).includes(session.user.id);
    }
    return (item.likedByGuests || []).includes(actorId);
  };

  const handlePostLike = async () => {
    if (isLikingPost) return;
    const previous = { likesCount, likedPost };
    const optimisticLiked = !likedPost;

    setIsLikingPost(true);
    setLikedPost(optimisticLiked);
    setLikesCount((prev) => Math.max(0, prev + (optimisticLiked ? 1 : -1)));
    setLikeAnimKey("post");

    const response = await toggleBlogLike({
      blogId,
      userId: session?.user.id,
      guestId: session?.user.id ? undefined : actorId,
    });

    setIsLikingPost(false);

    if (!response.success) {
      setLikesCount(previous.likesCount);
      setLikedPost(previous.likedPost);
      toast.error(response.message || "Unable to update blog like");
      return;
    }

    setLikedPost(Boolean(response.liked));
    setLikesCount(response.likesCount ?? likesCount);
    setTimeout(() => setLikeAnimKey(null), 220);
  };

  const submitComment = async (content: string, parentCommentId?: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!session?.user.id) {
      toast.error("Please sign in to join the conversation");
      return;
    }

    const now = new Date().toISOString();
    const tempId = `temp-${crypto.randomUUID()}`;

    if (parentCommentId) {
      setComments((prev) =>
        prev.map((c) =>
          c._id !== parentCommentId
            ? c
            : {
                ...c,
                replies: [
                  ...c.replies,
                  {
                    _id: tempId,
                    userId: session.user.id,
                    userName: session.user.name || "You",
                    userImage: session.user.image || "",
                    content: trimmed,
                    likesCount: 0,
                    likedByUsers: [],
                    likedByGuests: [],
                    createdAt: now,
                  },
                ],
              }
        )
      );
    } else {
      setComments((prev) => [
        ...prev,
        {
          _id: tempId,
          userId: session.user.id,
          userName: session.user.name || "You",
          userImage: session.user.image || "",
          content: trimmed,
          likesCount: 0,
          likedByUsers: [],
          likedByGuests: [],
          createdAt: now,
          replies: [],
        },
      ]);
    }

    setIsSubmitting(true);
    const response = await createBlogComment({ blogId, content: trimmed, parentCommentId });
    setIsSubmitting(false);

    if (!response.success) {
      setComments((prev) =>
        prev
          .map((c) => ({ ...c, replies: c.replies.filter((r) => r._id !== tempId) }))
          .filter((c) => c._id !== tempId)
      );
      toast.error(response.message || "Unable to submit comment");
      return;
    }

    const refreshed = await fetch(`/api/blogs/${slug}`, { cache: "no-store" }).then((res) => res.json());
    setComments(refreshed.comments || []);
    setCommentText("");
    setReplyDrafts({});
    setActiveReplyId(null);
    toast.success(response.message);
  };

  const toggleCommentLike = async ({ commentId, replyId }: { commentId: string; replyId?: string }) => {
    const key = replyId ? `${commentId}:${replyId}` : commentId;
    const findTarget = () => {
      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return null;
      return replyId ? comment.replies.find((r) => r._id === replyId) || null : comment;
    };

    const target = findTarget();
    if (!target) return;

    const currentlyLiked = isLikedByActor(target);
    const nextLiked = !currentlyLiked;

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        if (!replyId) {
          const likedByUsers = session?.user.id
            ? nextLiked
              ? [...new Set([...(c.likedByUsers || []), session.user.id])]
              : (c.likedByUsers || []).filter((id) => id !== session.user.id)
            : c.likedByUsers || [];
          const likedByGuests = !session?.user.id
            ? nextLiked
              ? [...new Set([...(c.likedByGuests || []), actorId])]
              : (c.likedByGuests || []).filter((id) => id !== actorId)
            : c.likedByGuests || [];
          return { ...c, likesCount: Math.max(0, c.likesCount + (nextLiked ? 1 : -1)), likedByUsers, likedByGuests };
        }

        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r._id !== replyId) return r;
            const likedByUsers = session?.user.id
              ? nextLiked
                ? [...new Set([...(r.likedByUsers || []), session.user.id])]
                : (r.likedByUsers || []).filter((id) => id !== session.user.id)
              : r.likedByUsers || [];
            const likedByGuests = !session?.user.id
              ? nextLiked
                ? [...new Set([...(r.likedByGuests || []), actorId])]
                : (r.likedByGuests || []).filter((id) => id !== actorId)
              : r.likedByGuests || [];
            return { ...r, likesCount: Math.max(0, r.likesCount + (nextLiked ? 1 : -1)), likedByUsers, likedByGuests };
          }),
        };
      })
    );
    setLikeAnimKey(key);

    const response = await toggleBlogCommentLike({
      blogId,
      commentId,
      replyId,
      userId: session?.user.id,
      guestId: session?.user.id ? undefined : actorId,
    });

    if (!response.success) {
      toast.error(response.message || "Unable to update like");
      const refreshed = await fetch(`/api/blogs/${slug}`, { cache: "no-store" }).then((res) => res.json());
      setComments(refreshed.comments || []);
      return;
    }

    setTimeout(() => setLikeAnimKey(null), 220);
  };

  const startEdit = (commentId: string, current: string, replyId?: string) => {
    setEditingTarget({ commentId, replyId });
    setEditText(current);
  };

  const saveEdit = async () => {
    if (!editingTarget) return;
    const trimmed = editText.trim();
    if (!trimmed) return;

    const { commentId, replyId } = editingTarget;
    const previous = comments;

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        if (!replyId) return { ...c, content: trimmed };
        return { ...c, replies: c.replies.map((r) => (r._id === replyId ? { ...r, content: trimmed } : r)) };
      })
    );

    setIsEditing(true);
    const response = await editBlogComment({ blogId, commentId, replyId, content: trimmed });
    setIsEditing(false);

    if (!response.success) {
      setComments(previous);
      toast.error(response.message || "Unable to update comment");
      return;
    }

    setEditingTarget(null);
    setEditText("");
    toast.success(response.message);
  };

  const removeComment = async (commentId: string, replyId?: string) => {
    const key = replyId ? `${commentId}:${replyId}` : commentId;
    const previous = comments;

    setComments((prev) =>
      prev
        .map((c) => ({
          ...c,
          replies: replyId && c._id === commentId ? c.replies.filter((r) => r._id !== replyId) : c.replies,
        }))
        .filter((c) => !(c._id === commentId && !replyId))
    );

    setIsDeletingKey(key);
    const response = await deleteBlogComment({ blogId, commentId, replyId });
    setIsDeletingKey(null);

    if (!response.success) {
      setComments(previous);
      toast.error(response.message || "Unable to delete comment");
      return;
    }

    toast.success(response.message);
  };

  return (
    <div id="comments" className="mt-8 mx-auto max-w-2xl space-y-6 sm:mt-10">
      <div className="flex items-center justify-between border-y py-2.5">
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <LikeButton
            count={likesCount}
            liked={likedPost}
            pending={isLikingPost}
            animate={likeAnimKey === "post"}
            onClick={handlePostLike}
            size="md"
          />
          <span className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            <span className="font-medium">{commentCount}</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {session?.user ? <UserAvatar name={session.user.name || "User"} image={session.user.image || undefined} /> : null}
          <div className="flex-1 space-y-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={session?.user.id ? "Add a comment..." : "Sign in to add a comment"}
              disabled={!session?.user.id || isSubmitting}
              className="min-h-20 resize-none border-border/60"
            />

            {session?.user.id ? (
              commentText.trim() ? (
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => submitComment(commentText)} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Post
                  </Button>
                </div>
              ) : null
            ) : (
              <div className="flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={signInToCommentHref}>Sign in to comment</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
        ) : null}

        {comments.map((comment) => {
          const isCommentOwner = session?.user.id === comment.userId;
          const commentLikeKey = comment._id;
          const threadCollapsed = collapsedThreads[comment._id] ?? false;

          return (
            <div key={comment._id} className="space-y-3">
              <div className="flex gap-2.5 sm:gap-3">
                <UserAvatar name={comment.userName} image={comment.userImage} />

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                    <span>{formatRelativeDate(comment.createdAt)}</span>
                  </div>

                  {editingTarget?.commentId === comment._id && !editingTarget.replyId ? (
                    <div className="space-y-2">
                      <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-16 text-sm" />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTarget(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={isEditing || !editText.trim()}>
                          {isEditing ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <LikeButton
                      count={comment.likesCount}
                      liked={isLikedByActor(comment)}
                      pending={false}
                      animate={likeAnimKey === commentLikeKey}
                      onClick={() => toggleCommentLike({ commentId: comment._id })}
                    />

                    {session?.user.id ? (
                      <button
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                      >
                        <Reply className="size-3.5" />
                        Reply
                      </button>
                    ) : (
                      <Link href={signInToCommentHref} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                        Sign in to reply
                      </Link>
                    )}

                    {isCommentOwner && (
                      <>
                        <button
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => startEdit(comment._id, comment.content)}
                        >
                          <Pencil className="size-3" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => removeComment(comment._id)}
                          disabled={isDeletingKey === comment._id}
                        >
                          {isDeletingKey === comment._id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                          Delete
                        </button>
                      </>
                    )}

                    {comment.replies.length > 0 && (
                      <button
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setCollapsedThreads((prev) => ({ ...prev, [comment._id]: !threadCollapsed }))
                        }
                      >
                        {threadCollapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
                        {threadCollapsed ? `Show ${comment.replies.length} replies` : "Hide replies"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!threadCollapsed && comment.replies.length > 0 && (
                <div className="ml-7 space-y-3 border-l border-border/70 pl-3 sm:ml-11 sm:pl-4">
                  {comment.replies.map((reply) => {
                    const isReplyOwner = session?.user.id === reply.userId;
                    const replyLikeKey = `${comment._id}:${reply._id}`;
                    const replyBeingEdited = editingTarget?.commentId === comment._id && editingTarget?.replyId === reply._id;
                    return (
                      <div key={reply._id} className="flex gap-2.5 sm:gap-3">
                        <UserAvatar name={reply.userName} image={reply.userImage} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-sm font-medium text-foreground">{reply.userName}</span>
                            <span>{formatRelativeDate(reply.createdAt)}</span>
                          </div>

                          {replyBeingEdited ? (
                            <div className="space-y-2">
                              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="min-h-16 text-sm" />
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setEditingTarget(null)}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveEdit} disabled={isEditing || !editText.trim()}>
                                  {isEditing ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.content}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-3">
                            <LikeButton
                              count={reply.likesCount}
                              liked={isLikedByActor(reply)}
                              pending={false}
                              animate={likeAnimKey === replyLikeKey}
                              onClick={() => toggleCommentLike({ commentId: comment._id, replyId: reply._id })}
                            />
                            {isReplyOwner && (
                              <>
                                <button
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => startEdit(comment._id, reply.content, reply._id)}
                                >
                                  <Pencil className="size-3" /> Edit
                                </button>
                                <button
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() => removeComment(comment._id, reply._id)}
                                  disabled={isDeletingKey === `${comment._id}:${reply._id}`}
                                >
                                  {isDeletingKey === `${comment._id}:${reply._id}` ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeReplyId === comment._id && (
                <div className="ml-7 space-y-2 border-l border-border/70 pl-3 sm:ml-11 sm:pl-4">
                  <Textarea
                    value={replyDrafts[comment._id] || ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                    placeholder={`Reply to ${comment.userName}...`}
                    className="min-h-16 resize-none text-sm"
                    autoFocus
                  />

                  <div className="flex justify-end gap-2">
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
                      onClick={() => submitComment(replyDrafts[comment._id] || "", comment._id)}
                      disabled={!(replyDrafts[comment._id] || "").trim() || isSubmitting}
                      className="gap-2"
                    >
                      {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      Reply
                    </Button>
                  </div>
                </div>
              )}

              {comment !== comments[comments.length - 1] ? <Separator className="!mt-5" /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
