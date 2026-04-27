"use client";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

let mermaidInitialized = false;

function ensureMermaidInitialized() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default",
    securityLevel: "loose",
  });
  mermaidInitialized = true;
}

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderId = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    ensureMermaidInitialized();

    void mermaid
      .render(renderId.current, chart)
      .then(({ svg, bindFunctions }) => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        bindFunctions?.(containerRef.current);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [chart]);

  if (error) {
    return (
      <pre className="my-4 overflow-x-auto rounded-xl bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto"
      role="img"
      aria-label="Mermaid diagram"
    />
  );
}
