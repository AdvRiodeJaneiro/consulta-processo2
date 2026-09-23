
import * as React from "react"
import { cn } from "../../lib/utils"

interface ShiningTextProps {
  text: string;
  className?: string;
}

export function ShiningText({ text, className }: ShiningTextProps) {
  return (
    <>
      <style>
        {`
          @keyframes shine {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      <h1
        className={cn(
          "bg-[linear-gradient(110deg,#94a3b8,35%,#fff,50%,#94a3b8,75%,#94a3b8)] bg-[length:200%_100%] bg-clip-text text-sm md:text-base font-normal text-transparent",
          className
        )}
        style={{
          animation: "shine 2s linear infinite"
        }}
      >
        {text}
      </h1>
    </>
  );
}
