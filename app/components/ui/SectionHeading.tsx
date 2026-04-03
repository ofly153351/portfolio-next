import React from "react";
import type { SectionHeadingProps } from "@/types/ui";

export default function SectionHeading({
  eyebrow,
  title,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "mb-16 text-center" : "mb-16"}>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#d2bbff]">
        {eyebrow}
      </h3>
      <h2 className="text-4xl font-bold tracking-tight text-[#e5e2e1]">{title}</h2>
    </div>
  );
}
