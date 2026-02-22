"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  date: string;
}

interface BlogQAProps {
  slug: string;
}

export default function BlogQA({ slug }: BlogQAProps) {
  const [entries, setEntries] = useState<QAEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/blog-qa?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => setLoadingEntries(false));
  }, [slug]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (streamingAnswer) scrollToBottom();
  }, [streamingAnswer, scrollToBottom]);

  const askQuestion = async () => {
    const q = question.trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setStreamingAnswer("");
    setStreamingQuestion(q);
    setQuestion("");

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
        const display = accumulated.replace(/\n<!--QA_ID:[^>]+-->$/, "");
        setStreamingAnswer(display);
      }

      const idMatch = accumulated.match(/<!--QA_ID:([^>]+)-->/);
      const cleanAnswer = accumulated
        .replace(/\n<!--QA_ID:[^>]+-->$/, "")
        .trim();

      const newEntry: QAEntry = {
        id: idMatch ? idMatch[1] : Date.now().toString(),
        question: q,
        answer: cleanAnswer,
        date: new Date().toISOString(),
      };
      setEntries((prev) => [...prev, newEntry]);
      setStreamingAnswer("");
      setStreamingQuestion("");
    } catch (e) {
      setStreamingAnswer(
        e instanceof Error ? e.message : "Bir hata oluştu. Tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            Soru &amp; Cevap
          </h3>
          <p className="text-xs text-muted">
            Bu makale hakkında soru sorun. AI, makalenin bilgi tabanına
            dayanarak yanıt verecektir.
          </p>
        </div>
      </div>

      {loadingEntries && (
        <div className="flex items-center gap-2 text-sm text-muted mb-4">
          <svg
            className="h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Yorumlar yükleniyor...
        </div>
      )}

      {entries.length > 0 && (
        <div className="mb-6 space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-border-dark bg-card-dark/50 p-4"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100">
                    {entry.question}
                  </p>
                  <time className="text-[10px] text-muted/60">
                    {formatDate(entry.date)}
                  </time>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                    {entry.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {streamingQuestion && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-card-dark/50 p-4">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              S
            </div>
            <p className="text-sm font-medium text-gray-100">
              {streamingQuestion}
            </p>
          </div>
          <div className="flex items-start gap-3 mt-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {streamingAnswer || "Düşünüyor..."}
                {isLoading && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-primary/60" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <div className="flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Örn: Kamçı etkisi nedir ve yazılım bunu nasıl çözer?"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-border-dark bg-surface-dark px-4 py-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-muted/60 focus:border-primary-light"
        />
        <button
          onClick={askQuestion}
          disabled={!question.trim() || isLoading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary-dark disabled:opacity-40"
        >
          {isLoading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>

      {entries.length === 0 && !loadingEntries && !streamingQuestion && (
        <p className="mt-3 text-center text-xs text-muted/50">
          Henüz soru sorulmamış. İlk soran siz olun!
        </p>
      )}
    </section>
  );
}
