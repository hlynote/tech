"use client";

import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "@/components/mermaid-diagram";

function extractMermaidChartFromPre(children: ReactNode): string | null {
  let only: ReactNode;
  try {
    only = Children.only(children);
  } catch {
    return null;
  }
  if (!isValidElement(only)) return null;

  const code = only as ReactElement<{ className?: string; children?: ReactNode }>;
  if (typeof code.type !== "string" || code.type !== "code") return null;

  const className = code.props.className ?? "";
  if (!className.includes("language-mermaid")) return null;

  return String(code.props.children).replace(/\n$/, "");
}

const components: Components = {
  pre({ children, ...props }) {
    const chart = extractMermaidChartFromPre(children);
    if (chart !== null) {
      return <MermaidDiagram chart={chart} />;
    }
    return (
      <pre {...props}>
        {children}
      </pre>
    );
  },
};

type BlogMarkdownProps = {
  content: string;
};

export function BlogMarkdown({ content }: BlogMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
