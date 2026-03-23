import DOMPurify from "dompurify";

interface SafeHtmlRendererProps {
  content: string;
  className?: string;
}

export function SafeHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  const safeHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "b", "i", "u", "ul", "ol", "li", "a", "br", "blockquote"],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    KEEP_CONTENT: true,
  });

  return (
    <div
      className={`prose prose-sm max-w-none prose-a:text-primary prose-a:underline prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
