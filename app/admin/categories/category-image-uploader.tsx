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

export default function CategoryImageUploader({ form }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(
    form.getValues("images") || []
  );

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  return (
    <FormField
      control={form.control}
      name="images"
      render={() => (
        <FormItem className="w-full">
          <FormLabel>Images</FormLabel>
          <Card>
            <CardContent className="space-y-4 mt-2 min-h-48">
              <div className="flex flex-col gap-2 mt-3">
                <span className="text-sm text-muted-foreground">
                  You can upload up to 1 image (max: 2MB each).
                </span>
                <FormControl>
                  <Card className="bg-muted">
                    <CardContent>
                      <UploadDropzone
                        endpoint="categoryImages"
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
