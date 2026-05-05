"use client";

import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { buildHeadingId, buildQuestionId, extractQuestionFromMarkdownLine } from "@/lib/markdown-toc";

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

type BlogMarkdownProps = {
  content: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), ["style"]],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "span"],
};

export function BlogMarkdown({ content }: BlogMarkdownProps) {
  const lines = content.split("\n");
  const questionAnchors = new Map<number, string>();
  for (let index = 0; index < lines.length; index += 1) {
    const question = extractQuestionFromMarkdownLine(lines[index]);
    if (!question) continue;
    questionAnchors.set(index + 1, buildQuestionId(question, index + 1));
  }

  const flattenText = (node: ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map((item) => flattenText(item)).join("");
    }
    if (isValidElement(node)) {
      return flattenText(node.props.children);
    }
    return "";
  };

  const headingWithId = (
    Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
    children: ReactNode,
    props: Record<string, unknown> & { node?: { position?: { start?: { line?: number } } } },
  ) => {
    const text = flattenText(children).trim();
    const line = props.node?.position?.start?.line;
    const id = buildHeadingId(text, line);
    return (
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  };

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
    h1({ children, ...props }) {
      return headingWithId("h1", children, props);
    },
    h2({ children, ...props }) {
      return headingWithId("h2", children, props);
    },
    h3({ children, ...props }) {
      return headingWithId("h3", children, props);
    },
    h4({ children, ...props }) {
      return headingWithId("h4", children, props);
    },
    h5({ children, ...props }) {
      return headingWithId("h5", children, props);
    },
    h6({ children, ...props }) {
      return headingWithId("h6", children, props);
    },
    li({ children, ...props }) {
      const line = props.node?.position?.start?.line;
      const id = line ? questionAnchors.get(line) : undefined;
      return (
        <li id={id} {...props}>
          {children}
        </li>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
