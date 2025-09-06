"use client";

import { useState, useEffect } from "react";
import { Clipboard, ClipboardCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Image from "next/image";

function ShareProduct({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProductUrl(`${window.location.origin}/product/${slug}`);
    }
  }, [slug]);

  const handleCopy = () => {
    if (!productUrl) return;
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const shareOnMobile = () => {
    if (navigator.share && productUrl) {
      navigator.share({
        title: name,
        text: `Check out this product: ${name}`,
        url: productUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex gap-3 mt-4">
      <Button
        onClick={handleCopy}
        className="flex gap-2 items-center bg-slate-600 hover:bg-slate-800 text-white"
      >
        {copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
        {copied ? "Copied!" : "Copy"}
      </Button>

      <Button
        onClick={shareOnMobile}
        className="flex gap-2 items-center bg-gray-700 hover:bg-gray-800 text-white"
      >
        <Share2 size={18} />
        Share
      </Button>

      <a
        href={`https://api.whatsapp.com/send?text=Check out this product: ${encodeURIComponent(name)} ${encodeURIComponent(productUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white px-2 py-0 rounded-md flex items-center"
      >
        <Image src={WhatsApp} alt="WhatsApp" width={24} height={24} />
      </a>
    </div>
  );
}

export default ShareProduct;
