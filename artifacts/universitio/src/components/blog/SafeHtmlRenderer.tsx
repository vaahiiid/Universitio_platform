interface SafeHtmlRendererProps {
  content: string;
  className?: string;
}

export function SafeHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  return (
    <div
      className={`prose prose-sm max-w-none prose-a:text-primary prose-a:underline prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
