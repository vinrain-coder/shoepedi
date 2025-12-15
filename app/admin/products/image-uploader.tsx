"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

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

/* ---------------------------- Sortable Item ---------------------------- */
function SortableMedia({
  item,
  onRemove,
}: {
  item: MediaItem;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative shrink-0"
    >
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
          <video
            src={item.url}
            className="w-full h-full object-cover"
            muted
          />
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
export default function ImageUploader({ form }: ImageUploaderProps) {
  const initialMedia: MediaItem[] = (form.getValues("images") || []).map(
    (url: string) => ({
      url,
      type: url.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
    })
  );

  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [progress, setProgress] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    form.setValue("images", media.map((m) => m.url));
  }, [media, form]);

  /* --------------------------- UploadThing --------------------------- */
  const { startUpload, isUploading } = useUploadThing("productImages", {
    onClientUploadComplete: (res) => {
      const uploaded: MediaItem[] = res.map((f) => ({
        url: f.url,
        type: f.url.match(/\.(mp4|webm|mov|ogg)$/i) ? "video" : "image",
      }));

      setProgress(0);
      setMedia((prev) => [...prev, ...uploaded]);
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

  /* --------------------------- Drag & Drop --------------------------- */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setMedia((items) => {
      const oldIndex = items.findIndex((i) => i.url === active.id);
      const newIndex = items.findIndex((i) => i.url === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  };

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

      // Remove locally
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
      name="images"
      render={() => (
        <FormItem className="w-full">
          <FormLabel>Product Media</FormLabel>

          <Card>
            <CardContent className="space-y-4 pt-4">
              {/* Preview & Reorder */}
              {media.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToHorizontalAxis]}
                >
                  <SortableContext
                    items={media.map((m) => m.url)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {media.map((item) => (
                        <SortableMedia
                          key={item.url}
                          item={item}
                          onRemove={() => handleRemove(item.url)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
                      className="bg-blue-600 h-3 rounded-full"
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
