export interface ParsedRichHtml {
  bodyContent: string;
  styles: string;
  inlineScript: string;
  externalScripts: string[];
  fontLinks: string[];
}

export function parseRichHtml(rawHtml: string): ParsedRichHtml {
  const externalScripts: string[] = [];
  const fontLinks: string[] = [];

  // Extract font links
  const fontLinkRegex = /<link[^>]+href="([^"]*fonts\.googleapis\.com[^"]*)"[^>]*>/gi;
  let match;
  while ((match = fontLinkRegex.exec(rawHtml)) !== null) {
    fontLinks.push(match[1]);
  }

  // Extract external script URLs (skip tailwind CDN)
  const scriptSrcRegex = /<script\s+src="([^"]+)"[^>]*><\/script>/gi;
  while ((match = scriptSrcRegex.exec(rawHtml)) !== null) {
    const url = match[1];
    if (!url.includes("tailwindcss")) {
      externalScripts.push(url);
    }
  }

  // Extract style content
  let styles = "";
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((match = styleRegex.exec(rawHtml)) !== null) {
    styles += match[1] + "\n";
  }

  // Scope styles: replace body selectors with .blog-rich-content
  styles = scopeStyles(styles);

  // Extract body content
  let bodyContent = "";
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1].trim();
  }

  // Remove any remaining script tags from body content, capture inline scripts
  let inlineScript = "";
  const inlineScriptRegex = /<script(?!\s+src)[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = inlineScriptRegex.exec(bodyContent)) !== null) {
    inlineScript += match[1] + "\n";
  }
  bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  return { bodyContent, styles, inlineScript, externalScripts, fontLinks };
}

function scopeStyles(css: string): string {
  // Replace body selector with .blog-rich-content
  css = css.replace(/\bbody\s*\{/g, ".blog-rich-content {");

  // Scope tag selectors like "h1, h2 { ... }"
  css = css.replace(
    /^(\s*)(h[1-6](?:\s*,\s*h[1-6])*)\s*\{/gm,
    (_, indent, selectors) => {
      const scoped = selectors
        .split(",")
        .map((s: string) => `.blog-rich-content ${s.trim()}`)
        .join(", ");
      return `${indent}${scoped} {`;
    }
  );

  // Scope class selectors (lines starting with . but not :root)
  css = css.replace(
    /^(\s*)(\.[\w-]+(?:\s*[,>+~]\s*\.[\w-]+)*)\s*\{/gm,
    (fullMatch, indent, selectors) => {
      if (selectors.includes("blog-rich-content")) return fullMatch;
      const scoped = selectors
        .split(",")
        .map((s: string) => `.blog-rich-content ${s.trim()}`)
        .join(", ");
      return `${indent}${scoped} {`;
    }
  );

  return css;
}
