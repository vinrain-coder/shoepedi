"use client";

import Image from "next/image";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";

export default function ReviewImageUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const { startUpload, isUploading } = useUploadThing("reviews", {
    onClientUploadComplete: (files) => {
      const uploaded = files[0]?.url;
      if (!uploaded) return;
      onChange(uploaded);
      toast.success("Review image uploaded");
    },
    onUploadError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await startUpload([file]);
    event.target.value = "";
  };

  const removeImage = async () => {
    if (!value) return;
    try {
      await fetch("/api/delete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
    } catch {
      // no-op: UI should still allow removing the reference
    }
    onChange("");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Optional photo</p>
          <p className="text-xs text-muted-foreground">
            Add a close-up or on-foot photo to help other shoppers.
          </p>
        </div>
        {value ? (
          <Button type="button" variant="ghost" size="icon" onClick={removeImage}>
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <Image
            src={value}
            alt="Review upload preview"
            width={800}
            height={600}
            className="h-52 w-full object-cover"
          />
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-muted-foreground/30 bg-background px-4 py-8 text-center transition hover:border-primary/40 hover:bg-primary/5">
          <span className="rounded-full bg-primary/10 p-3 text-primary">
            {isUploading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
          </span>
          <span className="text-sm font-medium">
            {isUploading ? "Uploading image..." : "Upload review image"}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, or WEBP up to 2MB.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
