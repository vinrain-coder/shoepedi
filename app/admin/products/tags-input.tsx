"use client";

import { useEffect, useState } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllTagsForAdminProductCreate } from "@/lib/actions/product.actions";

interface TagsInputProps {
  field: any; // react-hook-form field
}

export default function TagsInput({ field }: TagsInputProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      const tags = await getAllTagsForAdminProductCreate();
      setAvailableTags(tags);
    }
    fetchTags();
  }, []);

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">Tags</FormLabel>

      {/* Available tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTags.map((tag) => {
          const isSelected = field.value?.includes(tag);
          return (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => {
                if (!isSelected) {
                  field.onChange([...(field.value || []), tag]);
                }
              }}
              className="rounded-full px-4"
            >
              {tag}
            </Button>
          );
        })}
      </div>

      {/* Custom tags input */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {field.value?.map((tag: string, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border p-2 shadow-sm bg-background"
            >
              <Input
                autoFocus={index === field.value.length - 1}
                className="w-full"
                value={tag}
                onChange={(e) => {
                  const updatedTags = [...field.value];
                  updatedTags[index] = e.target.value;
                  field.onChange(updatedTags);
                }}
                placeholder="Enter a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => {
                  const updatedTags = field.value?.filter(
                    (_: string, i: number) => i !== index
                  );
                  field.onChange(updatedTags);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new empty entry */}
        <Button
          type="button"
          variant="secondary"
          onClick={() => field.onChange([...(field.value || []), ""])}
          className="w-full mt-2"
        >
          + Add Tag
        </Button>
      </div>

      <FormMessage />
    </FormItem>
  );
}
