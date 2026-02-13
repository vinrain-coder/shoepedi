"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ReadMore({
  children,
  maxHeight = 180,
  className,
}: {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowButton(contentRef.current.scrollHeight > maxHeight);
    }
  }, [maxHeight]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "transition-all duration-300 overflow-hidden",
          !expanded && "relative"
        )}
        style={{
          maxHeight: expanded ? contentRef.current?.scrollHeight : maxHeight,
        }}
      >
        {children}

        {!expanded && showButton && (
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent dark:bg-gradient-to-t dark:from-black/80 dark:to-transparent pointer-events-none" />
        )}
      </div>

      {showButton && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-primary font-medium hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
