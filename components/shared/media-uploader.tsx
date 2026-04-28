"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

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

const getMediaType = (url: string): MediaType =>
  /\.(mp4|webm|mov|ogg)$/i.test(url) ? "video" : "image";

/* ---------------- SAFE URL CHECK ---------------- */
const isValidUrl = (url?: string) =>
  typeof url === "string" &&
  url.trim() !== "" &&
  (url.startsWith("http") || url.startsWith("/"));

/* ---------------- Media Preview ---------------- */
function MediaPreview({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) {
  if (!isValidUrl(item.url)) return null;

  return (
    <div className="relative shrink-0">
      {item.type === "image" ? (
        <Image
          src={item.url}
          alt="Uploaded media"
          width={120}
          height={120}
          className="h-28 w-28 rounded-lg border object-cover"
        />
      ) : (
        <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-black/10">
          <video src={item.url} className="h-full w-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={32} className="text-white/80" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white shadow hover:bg-black"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ---------------- Main Component ---------------- */
type MediaUploaderProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
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
};

export default function MediaUploader<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  uploadRoute,
  multiple = false,
  maxFiles = multiple ? undefined : 1,
}: MediaUploaderProps<TFieldValues>) {
  const rawValue = form.getValues(name);

  const initialMedia: MediaItem[] = Array.isArray(rawValue)
    ? (rawValue as unknown[])
        .filter((value): value is string => isValidUrl(value))
        .map((url) => ({
          url,
          type: getMediaType(url),
        }))
    : isValidUrl(rawValue)
      ? [
          {
            url: rawValue as string,
            type: getMediaType(rawValue as string),
          },
        ]
      : [];

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [progress, setProgress] = useState(0);

  /* Sync with RHF */
  useEffect(() => {
    const value = multiple
      ? media.map((item) => item.url)
      : media[0]?.url || "";

    form.setValue(name, value as PathValue<TFieldValues, Path<TFieldValues>>, {
      shouldValidate: true,
    });
  }, [media, form, name, multiple]);

  /* UploadThing */
  const { startUpload, isUploading } = useUploadThing(uploadRoute, {
    onClientUploadComplete: (result) => {
      if (!result?.length) return;

      const uploaded: MediaItem[] = result
        .filter((file) => isValidUrl(file.url))
        .map((file) => ({
          url: file.url,
          type: getMediaType(file.url),
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
    onDrop: (acceptedFiles) => {
      void startUpload(acceptedFiles);
    },
  });

  /* Remove */
  const handleRemove = async (url: string) => {
    try {
      await fetch("/api/delete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      setMedia((prev) => prev.filter((item) => item.url !== url));
      toast.success("File deleted");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete uploaded file",
      );
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
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/30 bg-muted"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload
                </p>
              </div>

              {isUploading && (
                <div>
                  <div className="h-3 rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-primary"
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
