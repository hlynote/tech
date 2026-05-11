export type TocItem = {
  kind: "heading" | "question";
  text: string;
  id: string;
};

export type TocSection = {
  text: string;
  id: string;
  items: TocItem[];
};

function normalizeHeadingText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

function slugifyHeadingText(text: string): string {
  const normalized = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "section";
}

export function buildHeadingId(text: string, lineNumber?: number): string {
  const slug = slugifyHeadingText(text);
  if (!lineNumber || lineNumber < 1) {
    return slug;
  }
  return `${slug}-${lineNumber}`;
}

export function buildQuestionId(text: string, lineNumber?: number): string {
  const slug = `q-${slugifyHeadingText(text)}`;
  if (!lineNumber || lineNumber < 1) {
    return slug;
  }
  return `${slug}-${lineNumber}`;
}

export function extractQuestionFromMarkdownLine(line: string): string | null {
  const match = /^\s*(\d+)\.\s+\*\*(.+?)\*\*/.exec(line.trim());
  if (!match) return null;
  const number = match[1];
  const body = normalizeHeadingText(match[2]);
  if (!body) return null;
  return `${number}. ${body}`;
}

export function extractStructuredToc(content: string): TocSection[] {
  const lines = content.split("\n");
  const sections: TocSection[] = [];

  let inCodeFence = false;
  let currentSection: TocSection | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = normalizeHeadingText(headingMatch[2]);
      if (!text) continue;
      const id = buildHeadingId(text, index + 1);

      if (level === 2) {
        currentSection = {
          text,
          id,
          items: [],
        };
        sections.push(currentSection);
        continue;
      }

      if (level === 3 && currentSection) {
        currentSection.items.push({
          kind: "heading",
          text,
          id,
        });
      }
      continue;
    }

    const question = extractQuestionFromMarkdownLine(line);
    if (question && currentSection) {
      currentSection.items.push({
        kind: "question",
        text: question,
        id: buildQuestionId(question, index + 1),
      });
    }
  }

  return sections;
}
