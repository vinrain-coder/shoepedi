"use client";

import { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { X } from "lucide-react";
import { getAllTags } from "@/lib/actions/product.actions"; // adjust path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
  field: any; // react-hook-form field
}

export default function TagsInput({ field }: TagsInputProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      const tags = await getAllTags();
      setAvailableTags(tags);
    }
    fetchTags();
  }, []);

  return (
    <FormItem>
      <FormLabel>Tags</FormLabel>

      {/* Available tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              if (!field.value?.includes(tag)) {
                field.onChange([...(field.value || []), tag]);
              }
            }}
            className={`px-3 py-1 rounded-full border ${
              field.value?.includes(tag)
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Custom tags input */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {field.value?.map((tag: string, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg p-2 border"
            >
              <Input
                autoFocus={index === field.value.length - 1}
                className="w-full bg-transparent focus:outline-none focus:ring-2 rounded-lg"
                value={tag}
                onChange={(e) => {
                  const updatedTags = [...field.value];
                  updatedTags[index] = e.target.value;
                  field.onChange(updatedTags);
                }}
                placeholder="Enter a tag"
                onKeyDown={(e: { key: string; preventDefault: () => any }) =>
                  e.key === "Enter" && e.preventDefault()
                }
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  const updatedTags = field.value?.filter(
                    (_: any, i: number) => i !== index
                  );
                  field.onChange(updatedTags);
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => field.onChange([...(field.value || []), ""])}
          className="mt-2 w-full"
        >
          Add Tag
        </Button>
      </div>

      <FormMessage />
    </FormItem>
  );
}
