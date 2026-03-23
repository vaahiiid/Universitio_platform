interface SafeHtmlRendererProps {
  content: string;
  className?: string;
}

function sanitizeHtml(html: string): string {
  // Create a temporary DOM element to parse HTML safely
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Allowed tags and their permitted attributes
  const ALLOWED_TAGS: Record<string, string[]> = {
    p: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    strong: [],
    em: [],
    b: [],
    i: [],
    u: [],
    ul: [],
    ol: [],
    li: [],
    a: ["href", "title", "target", "rel"],
    br: [],
    blockquote: [],
  };

  function isSafeUrl(url: string): boolean {
    // Only allow http, https, mailto, and relative URLs
    const safeProtocols = ["http://", "https://", "mailto:", "/", "#"];
    const lowerUrl = url.toLowerCase().trim();
    return safeProtocols.some((protocol) => lowerUrl.startsWith(protocol));
  }

  function sanitizeNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!ALLOWED_TAGS[tagName]) {
      // Keep the content of disallowed tags
      const fragment = document.createDocumentFragment();
      for (let child of Array.from(element.childNodes)) {
        const sanitized = sanitizeNode(child);
        if (sanitized) {
          fragment.appendChild(sanitized);
        }
      }
      return fragment;
    }

    // Create a new allowed element
    const newElement = document.createElement(tagName);
    const allowedAttrs = ALLOWED_TAGS[tagName];

    // Copy only allowed attributes
    for (const attr of element.attributes) {
      if (allowedAttrs.includes(attr.name)) {
        // Additional validation for href
        if (attr.name === "href" && !isSafeUrl(attr.value)) {
          continue;
        }
        newElement.setAttribute(attr.name, attr.value);
      }
    }

    // Recursively sanitize children
    for (let child of Array.from(element.childNodes)) {
      const sanitized = sanitizeNode(child);
      if (sanitized) {
        newElement.appendChild(sanitized);
      }
    }

    return newElement;
  }

  const sanitized = sanitizeNode(temp);
  return sanitized ? sanitized.innerHTML : "";
}

export function SafeHtmlRenderer({ content, className = "" }: SafeHtmlRendererProps) {
  const safeHtml = sanitizeHtml(content);

  return (
    <div
      className={`prose prose-sm max-w-none prose-a:text-primary prose-a:underline prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
