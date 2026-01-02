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

type MediaType = "image" | "video";

type MediaItem = {
  url: string;
  type: MediaType;
};

interface MediaUploaderProps {
  form: any;
  name: string; // "images" | "image"
  label: string;
  uploadRoute:
    | "products"
    | "categories"
    | "brands"
    | "tags"
    | "blogs"
    | "pages";
  multiple?: boolean;
  maxFiles?: number;
}

/* ---------------- Media Preview ---------------- */
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
        <div className="w-28 h-28 relative rounded-lg border overflow-hidden bg-black/10">
          <video src={item.url} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={32} className="text-white/80" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 shadow"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ---------------- Main Component ---------------- */
export default function MediaUploader({
  form,
  name,
  label,
  uploadRoute,
  multiple = false,
  maxFiles = multiple ? undefined : 1,
}: MediaUploaderProps) {
  const rawValue = form.getValues(name);

  const initialMedia: MediaItem[] = Array.isArray(rawValue)
    ? rawValue.map((url: string) => ({
        url,
        type: url.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
      }))
    : rawValue
    ? [
        {
          url: rawValue,
          type: rawValue.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
        },
      ]
    : [];

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [progress, setProgress] = useState(0);

  /* Sync with RHF */
  useEffect(() => {
    const value = multiple ? media.map((m) => m.url) : media[0]?.url || "";

    form.setValue(name, value, { shouldValidate: true });
  }, [media, form, name, multiple]);

  /* UploadThing */
  const { startUpload, isUploading } = useUploadThing(uploadRoute, {
    onClientUploadComplete: (res) => {
      const uploaded = res.map((f) => ({
        url: f.url,
        type: f.url.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
      }));

      setProgress(0);
      setMedia((prev) => [...prev, ...uploaded]);

      toast.success("Upload completed");
    },
    onUploadProgress: setProgress,
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  /* Dropzone */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple,
    maxFiles,
    accept: {
      "image/*": [],
      "video/*": [],
    },
    onDrop: startUpload,
  });

  /* Remove */
  const handleRemove = async (url: string) => {
    try {
      await fetch("/api/delete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      setMedia((prev) => prev.filter((m) => m.url !== url));
      toast.success("File deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>

          <Card>
            <CardContent className="space-y-4 pt-4">
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
                  Drag & drop or click to upload
                </p>
              </div>

              {isUploading && (
                <div>
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
