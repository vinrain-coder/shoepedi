"use client";

import { useState, useEffect } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Facebook,
  Share2,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Image from "next/image";

function ShareBlog({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [blogUrl, setBlogUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBlogUrl(`${window.location.origin}/blogs/${slug}`);
    }
  }, [slug]);

  const handleCopy = () => {
    if (!blogUrl) return;
    navigator.clipboard.writeText(blogUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const shareOnMobile = () => {
    if (navigator.share && blogUrl) {
      navigator.share({
        title,
        text: `Check out this blog post: ${title}`,
        url: blogUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Copy Link Button */}
      <Button
        onClick={handleCopy}
        disabled={!blogUrl}
        className="flex gap-2 items-center bg-gray-600 hover:bg-gray-800 text-white cursor-pointer"
      >
        {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
        {copied ? "Copied!" : "Copy"}
      </Button>

      {/* Mobile Share Button */}
      <Button
        onClick={shareOnMobile}
        disabled={!blogUrl}
        className="flex gap-2 items-center bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
      >
        <Share2 size={18} />
        Share
      </Button>

      {/* Social Media Share Links */}
      {blogUrl && (
        <>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-md flex items-center"
          >
            <Facebook size={20} />
          </a>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(blogUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center"
          >
            <Twitter size={20} />
          </a>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this blog post: ${title} ${blogUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md flex items-center"
          >
            <Image src={WhatsApp} alt="WhatsApp" width={24} height={24} />
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-800 hover:bg-blue-900 text-white p-2 rounded-md flex items-center"
          >
            <Linkedin size={20} />
          </a>

          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this blog post: ${blogUrl}`)}`}
            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md flex items-center"
          >
            <Mail size={20} />
          </a>
        </>
      )}
    </div>
  );
}

export default ShareBlog;
