"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
  label?: string;
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
  label,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-ash font-medium min-w-[80px]">
          {label}
        </span>
      )}
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            className={`star ${
              star <= (hover || value) ? "filled" : "empty"
            } ${readonly ? "!cursor-default" : ""}`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={star <= (hover || value) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-sm font-mono text-ash">{value}/5</span>
      )}
    </div>
  );
}
