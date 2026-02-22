export interface TransformResult {
  html: string;
  externalScripts: string[];
  detectedTitle: string;
  detectedSummary: string;
}

const HEX_MAP: [RegExp, string][] = [
  [/#22c55e/gi, "#14b8a6"],
  [/#f97316/gi, "#f59e0b"],
  [/#0a2f29/gi, "#111827"],
  [/#113a33/gi, "#1f2937"],
  [/#ecfdf5/gi, "#1f2937"],
  [/#1a1a2e/gi, "#111827"],
  [/#f8fafc/gi, "#111827"],
  [/#ffffff/gi, "#1f2937"],
  [/#1f2937/gi, "#1f2937"],
];

const RGBA_MAP: [RegExp, string][] = [
  [/rgba\(\s*34\s*,\s*197\s*,\s*94/gi, "rgba(20, 184, 166"],
  [/rgba\(\s*249\s*,\s*115\s*,\s*22/gi, "rgba(245, 158, 11"],
  [/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/gi, "rgba(0,0,0,0)"],
];

const CSS_VAR_MAP: Record<string, string> = {
  "--bg-dark": "#111827",
  "--bg-panel": "#1f2937",
  "--text-light": "#e5e7eb",
  "--accent-green": "#14b8a6",
  "--accent-orange": "#f59e0b",
};

const TAILWIND_CLASS_MAP: [RegExp, string][] = [
  [/\btext-neon-green\b/g, "text-primary-light"],
  [/\btext-neon-orange\b/g, "text-accent"],
  [/\bbg-neon-green\b/g, "bg-primary"],
  [/\bbg-neon-orange\b/g, "bg-accent"],
  [/\bborder-neon-green\b/g, "border-primary-light"],
  [/\bborder-neon-orange\b/g, "border-accent"],
  [/\bbg-dark-bg\b/g, "bg-surface-dark"],
  [/\bbg-dark-panel\b/g, "bg-card-dark"],
  [/\bhover:border-neon-green\b/g, "hover:border-primary-light"],
  [/\bhover:border-neon-orange\b/g, "hover:border-accent"],
  [/\bhover:text-neon-green\b/g, "hover:text-primary-light"],
  [/\bhover:text-neon-orange\b/g, "hover:text-accent"],
  [/!bg-neon-orange/g, "!bg-accent"],
  [/!bg-neon-green/g, "!bg-primary"],
  [/!border-neon-orange/g, "!border-accent"],
  [/!border-neon-green/g, "!border-primary"],
  [/!color-dark-bg/g, "!text-gray-100"],
  [/\btext-gray-900\b/g, "text-gray-100"],
  [/\btext-gray-800\b/g, "text-gray-200"],
  [/\btext-gray-700\b/g, "text-gray-300"],
  [/\bbg-white\b/g, "bg-card-dark"],
  [/\bbg-gray-50\b/g, "bg-surface-dark"],
  [/\bbg-gray-100\b/g, "bg-surface-dark"],
  [/\bborder-gray-200\b/g, "border-border-dark"],
  [/\bborder-gray-300\b/g, "border-border-dark"],
];

function applyColorMap(text: string): string {
  for (const [pattern, replacement] of HEX_MAP) {
    text = text.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of RGBA_MAP) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

function transformCssVars(css: string): string {
  for (const [varName, newValue] of Object.entries(CSS_VAR_MAP)) {
    const re = new RegExp(
      `(${varName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\s*:\\s*)([^;]+)`,
      "g"
    );
    css = css.replace(re, `$1${newValue}`);
  }
  return css;
}

function cleanFonts(css: string): string {
  css = css.replace(
    /font-family:\s*['"]?Inter['"]?[^;]*;/gi,
    "font-family: var(--font-sans), system-ui, sans-serif;"
  );
  css = css.replace(
    /font-family:\s*['"]?Lora['"]?[^;]*;/gi,
    "font-family: var(--font-sans), system-ui, sans-serif;"
  );
  css = css.replace(
    /font-family:\s*['"]?Bangers['"]?[^;]*;/gi,
    "font-family: var(--font-sans), system-ui, sans-serif;"
  );
  return css;
}

function softenGlows(css: string): string {
  css = css.replace(
    /box-shadow:\s*0\s+0\s+\d+px\s+rgba\([^)]+\)/gi,
    "box-shadow: 0 2px 8px rgba(0,0,0,0.3)"
  );
  css = css.replace(
    /shadow-\[0_0_\d+px_rgba\([^)]+\)\]/g,
    "shadow-md"
  );
  return css;
}

function applyTailwindClassMap(html: string): string {
  for (const [pattern, replacement] of TAILWIND_CLASS_MAP) {
    html = html.replace(pattern, replacement);
  }
  return html;
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim().split("|")[0].trim();
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  return "";
}

function extractSummary(html: string): string {
  const metaMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  if (metaMatch) return metaMatch[1].trim();

  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (firstP) {
    const text = firstP[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 20) {
      return text.length > 200 ? text.slice(0, 197) + "..." : text;
    }
  }
  return "";
}

function extractExternalScripts(html: string): string[] {
  const scripts: string[] = [];
  const re = /<script\s+src="([^"]+)"[^>]*><\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (!url.includes("tailwindcss")) {
      scripts.push(url);
    }
  }
  return scripts;
}

function removePageChrome(html: string): string {
  html = html.replace(/<nav[\s>][\s\S]*?<\/nav>/gi, "");
  html = html.replace(/<header[\s>][\s\S]*?<\/header>/gi, "");
  html = html.replace(/<footer[\s>][\s\S]*?<\/footer>/gi, "");
  return html;
}

function removeAiConsultantSection(html: string): string {
  html = html.replace(
    /<section[^>]*class="[^"]*ai-consultant-box[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
    ""
  );
  return html;
}

function removeAiScriptCode(script: string): string {
  script = script.replace(/const\s+apiKey\s*=\s*['"][^'"]*['"];?/g, "");
  script = script.replace(
    /async\s+function\s+analyzeScenario\s*\([^)]*\)\s*\{[\s\S]*?^\s*\}/m,
    ""
  );
  return script;
}

export function transformHtml(rawHtml: string): TransformResult {
  const detectedTitle = extractTitle(rawHtml);
  const detectedSummary = extractSummary(rawHtml);
  const externalScripts = extractExternalScripts(rawHtml);

  // Extract style blocks
  let styles = "";
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRegex.exec(rawHtml)) !== null) {
    styles += m[1] + "\n";
  }

  // Extract body content
  let body = "";
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    body = bodyMatch[1].trim();
  } else {
    body = rawHtml;
  }

  // Extract inline scripts from body
  let inlineScript = "";
  const scriptRegex = /<script(?!\s+src)[^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRegex.exec(body)) !== null) {
    inlineScript += m[1] + "\n";
  }
  body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Remove page-level chrome (nav, header, footer)
  body = removePageChrome(body);

  // Remove AI consultant section
  body = removeAiConsultantSection(body);
  inlineScript = removeAiScriptCode(inlineScript);

  // Transform styles
  styles = transformCssVars(styles);
  styles = applyColorMap(styles);
  styles = cleanFonts(styles);
  styles = softenGlows(styles);

  // Remove CSS rules targeting removed page chrome
  styles = styles.replace(/nav[\s.#\[{][^{}]*\{[^}]*\}/gi, "");
  styles = styles.replace(/header[\s.#\[{][^{}]*\{[^}]*\}/gi, "");
  styles = styles.replace(/footer[\s.#\[{][^{}]*\{[^}]*\}/gi, "");

  // Scope global selectors to .blog-article container
  styles = styles.replace(/\b:root\b/g, ".blog-article");
  styles = styles.replace(/\bbody\b(?=\s*\{)/g, ".blog-article");

  // Transform body HTML
  body = applyTailwindClassMap(body);
  body = applyColorMap(body);
  body = softenGlows(body);

  // Transform inline script
  inlineScript = applyColorMap(inlineScript);

  // DOMContentLoaded/onload already fired by the time scripts run via new Function()
  inlineScript = inlineScript.replace(
    /window\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*(\w+)\s*\)/g,
    "setTimeout($1, 0)"
  );
  inlineScript = inlineScript.replace(
    /document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*(\w+)\s*\)/g,
    "setTimeout($1, 0)"
  );
  inlineScript = inlineScript.replace(
    /window\.onload\s*=\s*(\w+)\s*;/g,
    "setTimeout($1, 0);"
  );
  inlineScript = inlineScript.replace(
    /window\.onload\s*=\s*\(\s*\)\s*=>\s*\{/g,
    "setTimeout(() => {"
  );
  inlineScript = inlineScript.replace(
    /window\.onload\s*=\s*function\s*\(\s*\)\s*\{/g,
    "setTimeout(function() {"
  );

  // Assemble final clean HTML (no DOCTYPE/html/head/body wrappers)
  let finalHtml = "";

  if (styles.trim()) {
    finalHtml += `<style>\n${styles.trim()}\n</style>\n\n`;
  }

  finalHtml += `<div class="blog-article">\n${body.trim()}\n</div>`;

  if (inlineScript.trim()) {
    finalHtml += `\n\n<script data-blog-script>\n${inlineScript.trim()}\n</script>`;
  }

  return { html: finalHtml, externalScripts, detectedTitle, detectedSummary };
}

export function generateSlug(title: string): string {
  const trMap: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return title
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (ch) => trMap[ch] || ch)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
