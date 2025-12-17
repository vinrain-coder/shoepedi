"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { X, Play } from "lucide-react";

type MediaItem = {
  url: string;
  type: "image" | "video";
};

type ImageUploaderProps = {
  form: any;
};

/* ---------------------------- Media Item ---------------------------- */
function MediaPreview({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) {
  return (
    <div className="relative shrink-0">
      {item.type === "image" ? (
        <Image
          src={item.url}
          alt="Uploaded media"
          width={120}
          height={120}
          className="w-28 h-28 object-cover rounded-lg border"
        />
      ) : (
        <div className="w-28 h-28 relative rounded-lg border overflow-hidden bg-black/10 flex items-center justify-center">
          <video src={item.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Play size={32} className="text-white/80" />
          </div>
        </div>
      )}

      {/* Remove Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 shadow"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ---------------------------- Main Component ---------------------------- */
export default function CategoryImageUploader({ form }: ImageUploaderProps) {
  const currentImageUrl = form.getValues("image");

  const initialMedia: MediaItem[] = currentImageUrl
    ? [
        {
          url: currentImageUrl,
          type: currentImageUrl.match(/\.(mp4|webm|mov|ogg)$/i)
            ? "video"
            : "image",
        },
      ]
    : [];

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);

  useEffect(() => {
    // 2. Set the first uploaded file URL to the "image" field
    const url = media.length > 0 ? media[0].url : "";
    form.setValue("image", url, { shouldValidate: true });
  }, [media, form]);
  const [progress, setProgress] = useState(0);

  /* --------------------------- UploadThing --------------------------- */
  const { startUpload, isUploading } = useUploadThing("categories", {
    onClientUploadComplete: (res) => {
      const uploaded: MediaItem = {
        url: res[0].url,
        type: res[0].url.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
      };
      setMedia([uploaded]); // Replace existing with new one
      toast.success("Upload completed");
    },
    onUploadProgress: setProgress,
    onUploadError: (e) => toast.error(e.message),
  });

  /* --------------------------- Dropzone --------------------------- */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: (files) => startUpload(files),
  });

  /* --------------------------- Remove File --------------------------- */
  const handleRemove = async (url: string) => {
    try {
      const res = await fetch("/api/delete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");

      setMedia((prev) => prev.filter((m) => m.url !== url));
      toast.success("File deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  /* --------------------------- UI --------------------------- */
  return (
    <FormField
      control={form.control}
      name="image"
      render={() => (
        <FormItem className="w-full">
          <FormLabel>Product Media</FormLabel>

          <Card>
            <CardContent className="space-y-4 pt-4">
              {/* Preview */}
              {media.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {media.map((item) => (
                    <MediaPreview
                      key={item.url}
                      item={item}
                      onRemove={() => handleRemove(item.url)}
                    />
                  ))}
                </div>
              )}

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 bg-muted"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-muted-foreground">
                  Drag & drop images or videos, or click to upload
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Supports multiple files
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-center text-sm">{progress}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
