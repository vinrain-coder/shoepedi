"use client";

import { useState, useEffect } from "react";
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
  FormControl,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";

type ImageUploaderProps = {
  form: any;
};

function SortableImage({ url }: { url: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Image
        src={url}
        alt="Product Image"
        className="w-20 h-20 object-cover rounded-md shadow-md"
        width={100}
        height={100}
      />
    </div>
  );
}

export default function ImageUploader({ form }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(
    form.getValues("images") || []
  );

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over?.id as string);
      const updated = arrayMove(images, oldIndex, newIndex);
      setImages(updated);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  // const handleUploadComplete = (res: { url: string }[]) => {
  //   const uploaded = res.map((f) => f.url);
  //   const updated = Array.from(new Set([...images, ...uploaded]));
  //   setImages(updated);
  //   toast.success("Images uploaded successfully!");
  // };

  return (
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
                      {images.map((img) => (
                        <SortableImage key={img} url={img} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Remove buttons below images */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((_, i) => (
                    <button
                      key={`remove-${i}`}
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="px-3 py-1 bg-red-400 rounded-md shadow hover:bg-red-600"
                    >
                      Remove Image {i + 1}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-3">
                <span className="text-sm text-muted-foreground">
                  You can upload up to 6 images (max: 1MB each).
                </span>
                <FormControl>
                  <Card className="bg-muted">
                    <CardContent>
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          const uploadedImages = res.map((file) => file.url);
                          const updatedImages = Array.from(
                            new Set([...images, ...uploadedImages])
                          );
                          setImages(updatedImages);
                          form.setValue("images", updatedImages);
                          toast.success("Images uploaded successfully!");
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`ERROR! ${error.message}`);
                        }}
                      />
                    </CardContent>
                  </Card>
                </FormControl>
              </div>
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
