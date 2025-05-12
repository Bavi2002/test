"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  description: string;
  category: string;
  tags?: string[];
}

export default function AboutSection({ description, category, tags }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <section className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">About this bot</h2>

      <div className="relative">
        <p
          className={cn(
            "text-muted-foreground text-sm sm:text-base leading-relaxed transition-all duration-300",
            !expanded && "line-clamp-3"
          )}
        >
          {description}
        </p>

        <Button
          variant="link"
          size="sm"
          className="px-0 mt-1 text-sm"
          onClick={toggleExpanded}
        >
          {expanded ? "See less" : "See more"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Badge variant="outline" className="text-sm font-medium">
          {category}
        </Badge>
        {tags && (
          tags.map((tag, tagIndex) => (
            <Badge
              key={`${tag}-${tagIndex}`}
              variant="outline"
              className="text-sm font-medium"
            >
              {tag}
            </Badge>
          ))
        )}
      </div>
    </section>
  );
}