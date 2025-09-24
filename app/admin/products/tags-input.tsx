"use client";

import { useEffect, useState } from "react";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { getAllTagsForAdminProductCreate } from "@/lib/actions/product.actions";

interface TagsInputProps {
  field: {
    value: string[];
    onChange: (val: string[]) => void;
  };
}

export default function TagsInput({ field }: TagsInputProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch predefined tags on mount
  useEffect(() => {
    async function fetchTags() {
      const tags = await getAllTagsForAdminProductCreate();
      setAvailableTags(tags.filter((t) => t && t.trim() !== "")); // remove empty tags
    }
    fetchTags();
  }, []);

  // Ensure field value is always an array
  const currentTags = Array.isArray(field.value) ? field.value : [];

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (currentTags.includes(tag)) {
      field.onChange(currentTags.filter((t) => t !== tag));
    } else {
      field.onChange([...currentTags, tag]);
    }
  };

  return (
    <FormItem>
      <FormLabel className="text-sm font-medium">Tags</FormLabel>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const selected = currentTags.includes(tag);
          return (
            <Button
              key={tag}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-4 ${
                selected ? "ring-2 ring-primary" : ""
              }`}
            >
              {tag}
            </Button>
          );
        })}
      </div>

      <FormMessage />
    </FormItem>
  );
}
