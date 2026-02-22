"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface RichBlogContentProps {
  bodyContent: string;
  styles: string;
  inlineScript: string;
  externalScripts: string[];
  fontLinks: string[];
}

export default function RichBlogContent({
  bodyContent,
  styles,
  inlineScript,
  externalScripts,
  fontLinks,
}: RichBlogContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoadedRef = useRef(0);

  useEffect(() => {
    // Inject font links
    fontLinks.forEach((href) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, [fontLinks]);

  const handleScriptLoad = () => {
    scriptsLoadedRef.current += 1;
    if (scriptsLoadedRef.current >= externalScripts.length && inlineScript) {
      setTimeout(() => {
        try {
          const fn = new Function(inlineScript);
          fn();
        } catch (e) {
          console.error("Blog script error:", e);
        }
      }, 100);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {externalScripts.map((src, i) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          onLoad={i === externalScripts.length - 1 ? handleScriptLoad : undefined}
        />
      ))}
      <div
        ref={containerRef}
        className="blog-rich-content"
        dangerouslySetInnerHTML={{ __html: bodyContent }}
      />
    </>
  );
}
