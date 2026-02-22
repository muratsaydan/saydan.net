"use client";

import { useState, useRef } from "react";

interface BlogQAProps {
  slug: string;
}

export default function BlogQA({ slug }: BlogQAProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const askQuestion = async () => {
    const q = question.trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/blog-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, question: q }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Bir hata oluştu");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Stream okunamadı");

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAnswer(accumulated);
      }
    } catch (e) {
      setAnswer(e instanceof Error ? e.message : "Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bu makale hakkında soru sorun</h3>
          <p className="text-xs text-muted">AI, makalenin içeriğine dayanarak yanıt verecektir.</p>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Örn: Kamçı etkisi nedir ve yazılım bunu nasıl çözer?"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-muted/60 focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:text-gray-100 dark:focus:border-primary-light"
        />
        <button
          onClick={askQuestion}
          disabled={!question.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary-dark disabled:opacity-40"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>

      {answer && (
        <div className="mt-4 rounded-xl border border-border bg-white p-4 dark:border-border-dark dark:bg-card-dark">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {answer}
          </div>
          {isLoading && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-primary/60" />
          )}
        </div>
      )}
    </section>
  );
}
