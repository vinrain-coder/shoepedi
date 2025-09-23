"use client";

import { useState, useCallback } from "react";
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

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

// Sortable image item component
function SortableImage({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: url });

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
      className="relative"
    >
      <Image
        src={url}
        alt="product image"
        className="w-20 h-20 object-cover object-center rounded-md shadow-md"
        width={100}
        height={100}
      />
      <Button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full shadow-md hover:bg-red-600"
      >
        <X size={16} />
      </Button>
    </div>
  );
}

type ImageUploaderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
};

const ImageUploader = ({ form }: ImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(
    form.getValues("images") || []
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img === active.id);
      const newIndex = images.findIndex((img) => img === over?.id);
      const reordered = arrayMove(images, oldIndex, newIndex);
      setImages(reordered);
      form.setValue("images", reordered);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length + images.length > 6) {
        toast.error("You can upload up to 6 images only.");
        return;
      }

      const newImages: string[] = [];

      acceptedFiles.forEach((file) => {
        if (file.size > 1024 * 1024) {
          toast.error(`${file.name} is too large (max 1MB).`);
          return;
        }
        const preview = URL.createObjectURL(file);
        newImages.push(preview);
      });

      const updatedImages = Array.from(new Set([...images, ...newImages]));
      setImages(updatedImages);
      form.setValue("images", updatedImages);

      if (newImages.length > 0) toast.success("Images uploaded successfully!");
    },
    [images, form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem className="w-full">
            <FormLabel>Images</FormLabel>
            <Card>
              <CardContent className="space-y-4 mt-2 min-h-48">
                {images.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToHorizontalAxis]}
                  >
                    <SortableContext
                      items={images}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex items-center gap-3 overflow-x-auto">
                        {images.map((image, index) => (
                          <SortableImage
                            key={image}
                            url={image}
                            index={index}
                            onRemove={handleRemoveImage}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer ${
                    isDragActive
                      ? "border-primary bg-muted-foreground"
                      : "border-muted"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-gray-500 text-center">
                    Drag & drop images here, or click to browse
                  </p>
                  <span className="text-xs text-gray-400">
                    (Max 6 images, 1MB each)
                  </span>
                </div>
              </CardContent>
            </Card>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ImageUploader;
