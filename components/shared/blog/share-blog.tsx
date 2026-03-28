"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Check,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Image from "next/image";

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  action: () => void;
}

function ShareBlog({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [blogUrl, setBlogUrl] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBlogUrl(`${window.location.origin}/blogs/${slug}`);
    }
  }, [slug]);

  const handleCopy = () => {
    if (!blogUrl) return;
    navigator.clipboard.writeText(blogUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  };

  const shareOnMobile = () => {
    if (navigator.share && blogUrl) {
      navigator
        .share({
          title,
          text: `Check out this blog post: ${title}`,
          url: blogUrl,
        })
        .then(() => setOpen(false))
        .catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  const shareOptions: ShareOption[] = [
    {
      name: "Facebook",
      icon: <Facebook className="size-4" />,
      color: "text-[#1877F2]",
      hoverColor: "hover:bg-[#1877F2]/10",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "Twitter",
      icon: <Twitter className="size-4" />,
      color: "text-[#1DA1F2]",
      hoverColor: "hover:bg-[#1DA1F2]/10",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(blogUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="size-4" />,
      color: "text-[#0A66C2]",
      hoverColor: "hover:bg-[#0A66C2]/10",
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "WhatsApp",
      icon: (
        <Image
          src={WhatsApp}
          alt="WhatsApp"
          width={16}
          height={16}
          className="size-4"
        />
      ),
      color: "text-[#25D366]",
      hoverColor: "hover:bg-[#25D366]/10",
      action: () => {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this blog post: ${title} ${blogUrl}`)}`,
          "_blank",
          "noopener,noreferrer"
        );
        setOpen(false);
      },
    },
    {
      name: "Email",
      icon: <Mail className="size-4" />,
      color: "text-muted-foreground",
      hoverColor: "hover:bg-muted",
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this blog post: ${blogUrl}`)}`;
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-accent transition-colors"
          disabled={!blogUrl}
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Share this post</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {title}
            </p>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-muted rounded-md text-xs text-muted-foreground truncate font-mono">
                {blogUrl || "Loading..."}
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant={copied ? "default" : "outline"}
                className="gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Options */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Share via
            </p>
            <div className="grid gap-1">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md transition-colors ${option.hoverColor} group`}
                >
                  <div className={option.color}>{option.icon}</div>
                  <span className="text-sm font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-popover px-2 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              <Button
                onClick={shareOnMobile}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Share2 className="size-4" />
                More sharing options
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ShareBlog;
