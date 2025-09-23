"use client";

import { useState } from "react";
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
  FormControl,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { X } from "lucide-react";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";

type ImageUploaderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
};

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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}

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

                {/* Upload Dropzone */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-500">
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
    </div>
  );
};

export default ImageUploader;
