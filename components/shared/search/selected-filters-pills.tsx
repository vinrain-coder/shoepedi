"use client";

import React from "react";

type ParamsShape = {
  q?: string;
  category?: string;
  tag?: string;
  price?: string;
  rating?: string;
  sort?: string;
  page?: string;
};

export default function SelectedFiltersPills({
  params,
  onRemove,
}: {
  params: ParamsShape;
  onRemove: (key: keyof ParamsShape) => void;
}) {
  const pills: { key: keyof ParamsShape; label: string }[] = [];

  if (params.q && params.q !== "all" && params.q !== "") pills.push({ key: "q", label: `"${params.q}"` });
  if (params.category && params.category !== "all") pills.push({ key: "category", label: `Category: ${params.category}` });
  if (params.tag && params.tag !== "all") pills.push({ key: "tag", label: `Tag: ${params.tag}` });
  if (params.price && params.price !== "all") pills.push({ key: "price", label: `Price: ${params.price}` });
  if (params.rating && params.rating !== "all") pills.push({ key: "rating", label: `Rating: ${params.rating}+` });

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={() => onRemove(p.key)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
          aria-label={`Remove filter ${p.label}`}
        >
          <span className="text-sm">{p.label}</span>
          <span className="w-4 h-4 flex items-center justify-center bg-primary text-white rounded-full text-xs">×</span>
        </button>
      ))}
    </div>
  );
      }
