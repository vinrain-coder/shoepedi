import React from "react";
import { Star } from "lucide-react";

export default function Rating({
  rating = 0,
  size = 18,
}: {
  rating: number;
  size?: number;
}) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);
  const starStyle = { width: size, height: size };

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="fill-primary text-primary"
          style={starStyle}
        />
      ))}
      {partialStar > 0 && (
        <div className="relative" style={starStyle}>
          <Star className="text-primary/30" style={starStyle} />
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: `${partialStar * 100}%`, height: size }}
          >
            <Star className="fill-primary text-primary" style={starStyle} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="text-primary/30" style={starStyle} />
      ))}
    </div>
  );
}
