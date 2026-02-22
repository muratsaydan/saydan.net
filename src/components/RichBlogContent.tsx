"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface RichBlogContentProps {
  content: string;
  externalScripts: string[];
}

export default function RichBlogContent({
  content,
  externalScripts,
}: RichBlogContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoadedRef = useRef(0);
  const scriptExecutedRef = useRef(false);

  const executeInlineScripts = () => {
    if (scriptExecutedRef.current || !containerRef.current) return;
    scriptExecutedRef.current = true;

    const scriptElements =
      containerRef.current.querySelectorAll("script[data-blog-script]");
    scriptElements.forEach((el) => {
      try {
        const fn = new Function(el.textContent || "");
        fn();
      } catch (e) {
        console.error("Blog script error:", e);
      }
    });
  };

  const handleScriptLoad = () => {
    scriptsLoadedRef.current += 1;
    if (scriptsLoadedRef.current >= externalScripts.length) {
      setTimeout(executeInlineScripts, 100);
    }
  };

  useEffect(() => {
    if (externalScripts.length === 0) {
      setTimeout(executeInlineScripts, 100);
    }
  }, [externalScripts.length]);

  return (
    <>
      {externalScripts.map((src) => (
        <Script
          key={src}
          src={src}
          strategy="afterInteractive"
          onLoad={handleScriptLoad}
        />
      ))}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
