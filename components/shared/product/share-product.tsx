"use client";

import { useState, useEffect } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import WhatsApp from "@/public/icons/whatsapp.svg";
import Image from "next/image";

function ShareProduct({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProductUrl(`${window.location.origin}/product/${slug}`);
    }
  }, [slug]);

  const handleCopy = () => {
    if (!productUrl) return;
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 2000);
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

  const shareOnWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this product: ${name} ${productUrl}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-accent transition-colors"
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Share this product
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex-1 gap-2 h-9"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="size-4" />
                  Copy link
                </>
              )}
            </Button>

            <Button
              onClick={shareOnWhatsApp}
              size="sm"
              className="gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white h-9"
            >
              <Image src={WhatsApp} alt="WhatsApp" width={16} height={16} />
              WhatsApp
            </Button>
          </div>

          {navigator.share && (
            <>
              <div className="relative my-3">
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
                className="w-full gap-2 h-9"
              >
                <Share2 className="size-4" />
                More options
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ShareProduct;
    
