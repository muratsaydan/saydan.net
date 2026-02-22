"use client";

import { useState, useRef, useCallback, useMemo, type DragEvent } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;

const AVAILABLE_TAGS = [
  "lojistik",
  "yazılım",
  "yapay-zeka",
  "genel",
  "kişisel",
  "teknoloji",
  "saas",
];

const MEDIA_EXT_RE = /\.(jpg|jpeg|png|webp|gif|svg|mp4|webm)$/i;

function detectMediaRefs(html: string): string[] {
  const refs: string[] = [];
  const re = /(?:src|poster)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) continue;
    if (!MEDIA_EXT_RE.test(url)) continue;
    const filename = url.split("/").pop() || url;
    if (!refs.includes(filename)) refs.push(filename);
  }
  return refs;
}

export default function NewBlogPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [htmlInput, setHtmlInput] = useState<string>("");
  const [htmlInputMode, setHtmlInputMode] = useState<"paste" | "file">("paste");
  const [htmlFileName, setHtmlFileName] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [kbFile, setKbFile] = useState<File | null>(null);

  // Detected media & uploaded assets
  const [detectedMedia, setDetectedMedia] = useState<string[]>([]);
  const [assetFiles, setAssetFiles] = useState<Map<string, File>>(new Map());
  const [showAssetUpload, setShowAssetUpload] = useState(false);

  // Step 2 state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slug, setSlug] = useState("");

  // Step 3 state
  const [transformedHtml, setTransformedHtml] = useState("");
  const [externalScripts, setExternalScripts] = useState<string[]>([]);

  // General state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState(false);

  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const kbInputRef = useRef<HTMLInputElement>(null);

  const blobUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    assetFiles.forEach((file, name) => {
      map.set(name, URL.createObjectURL(file));
    });
    return map;
  }, [assetFiles]);

  const previewHtml = useMemo(() => {
    if (!transformedHtml || blobUrlMap.size === 0) return transformedHtml;
    let html = transformedHtml;
    blobUrlMap.forEach((blobUrl, filename) => {
      const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(
        new RegExp(`(src|poster)=["'](?:[^"']*\\/)?${escaped}["']`, "gi"),
        `$1="${blobUrl}"`
      );
    });
    return html;
  }, [transformedHtml, blobUrlMap]);

  const missingAssets = useMemo(
    () => detectedMedia.filter((name) => !assetFiles.has(name)),
    [detectedMedia, assetFiles]
  );

  const handleFileDrop = useCallback(
    (e: DragEvent, setter: (f: File | null) => void, accept: string[]) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        setter(file);
      }
    },
    []
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-primary/5");
  };

  const handleDragLeave = (e: DragEvent) => {
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");
  };

  const handleAssetUpload = (expectedName: string, file: File) => {
    setAssetFiles((prev) => {
      const next = new Map(prev);
      next.set(expectedName, file);
      return next;
    });
  };

  const proceedToMetadata = async () => {
    const raw = htmlInput.trim();
    if (!raw) {
      setError("HTML içeriği gerekli.");
      return;
    }

    // If media detected but not all uploaded, block
    if (showAssetUpload && missingAssets.length > 0) {
      setError(`${missingAssets.length} görsel/video eksik. Lütfen yükleyin.`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/private/blog/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawHtml: raw }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || "Dönüştürme hatası");
        }
        throw new Error(`Sunucu hatası (${res.status})`);
      }

      const data = await res.json();
      setTransformedHtml(data.transformedHtml);
      setExternalScripts(data.externalScripts || []);
      if (data.detectedTitle && !title) setTitle(data.detectedTitle);
      if (data.detectedSummary && !summary) setSummary(data.detectedSummary);
      if (data.suggestedSlug && !slug) setSlug(data.suggestedSlug);

      // Detect media references in the transformed HTML
      const media = detectMediaRefs(data.transformedHtml);
      setDetectedMedia(media);

      if (media.length > 0 && !showAssetUpload) {
        // First time: show asset upload section, stay on step 1
        setShowAssetUpload(true);
      } else {
        setStep(2);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToPreview = () => {
    if (!title.trim()) { setError("Başlık gerekli."); return; }
    if (!slug.trim()) { setError("Slug gerekli."); return; }
    setError("");
    setStep(3);
  };

  const publish = async () => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("title", title);
      formData.append("date", date);
      formData.append("summary", summary);
      formData.append("tags", tags.join(","));
      formData.append("transformedHtml", transformedHtml);
      formData.append("externalScripts", JSON.stringify(externalScripts));
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      if (kbFile) formData.append("knowledgeBase", kbFile);
      assetFiles.forEach((file) => {
        formData.append("assets", file, file.name);
      });

      const res = await fetch("/api/private/blog/publish", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || "Yayınlama hatası");
        }
        throw new Error(`Sunucu hatası (${res.status})`);
      }

      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Yayınlama hatası");

      setPublishSuccess(true);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const generateSlugFromTitle = () => {
    const trMap: Record<string, string> = {
      ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
      Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
    };
    setSlug(
      title.toLowerCase()
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, (ch) => trMap[ch] || ch)
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80)
    );
  };

  const resetAll = () => {
    setStep(1);
    setHtmlInput("");
    setHtmlFileName("");
    setHtmlInputMode("paste");
    setThumbnailFile(null);
    setKbFile(null);
    setDetectedMedia([]);
    setAssetFiles(new Map());
    setShowAssetUpload(false);
    setTitle("");
    setSummary("");
    setTags([]);
    setSlug("");
    setTransformedHtml("");
    setExternalScripts([]);
    setPublishSuccess(false);
    setError("");
  };

  return (
    <div className="py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/private" className="text-sm text-muted transition-colors hover:text-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Yeni Blog Yazısı</h1>
      </div>

      {/* Steps indicator */}
      <div className="mb-10 flex items-center gap-2">
        {[
          { n: 1, label: "İçerik" },
          { n: 2, label: "Metadata" },
          { n: 3, label: "Önizle" },
          { n: 4, label: "Yayınla" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step >= n ? "bg-primary text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
              {step > n ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              ) : n}
            </div>
            <span className={`text-xs font-medium ${step >= n ? "text-primary" : "text-muted"}`}>{label}</span>
            {n < 4 && <div className={`mx-1 h-px w-8 ${step > n ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">İçerik Yükle</h2>

          {/* HTML input mode toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              HTML İçerik <span className="text-red-500">*</span>
            </label>
            <div className="mb-3 flex gap-2">
              <button
                onClick={() => setHtmlInputMode("paste")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${htmlInputMode === "paste" ? "bg-primary text-white" : "border border-border text-muted hover:border-primary dark:border-border-dark"}`}
              >
                Yapıştır
              </button>
              <button
                onClick={() => setHtmlInputMode("file")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${htmlInputMode === "file" ? "bg-primary text-white" : "border border-border text-muted hover:border-primary dark:border-border-dark"}`}
              >
                Dosya Yükle
              </button>
            </div>

            {htmlInputMode === "paste" ? (
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={12}
                placeholder="Gemini'den gelen HTML kodunu buraya yapıştırın..."
                className="w-full rounded-xl border border-border bg-white px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light"
              />
            ) : (
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f && /\.(html?|htm)$/i.test(f.name)) {
                    f.text().then((t) => { setHtmlInput(t); setHtmlFileName(f.name); });
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => htmlFileInputRef.current?.click()}
                className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 dark:border-border-dark"
              >
                {htmlFileName ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{htmlFileName}</span>
                    <button onClick={(e) => { e.stopPropagation(); setHtmlInput(""); setHtmlFileName(""); }} className="ml-2 text-xs text-red-500 hover:text-red-700">Kaldır</button>
                  </div>
                ) : (
                  <div>
                    <svg className="mx-auto mb-2 h-8 w-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    <p className="text-sm text-muted">HTML dosyası (.html)</p>
                    <p className="mt-1 text-xs text-muted/60">Sürükle-bırak veya tıklayarak seç</p>
                  </div>
                )}
                <input
                  ref={htmlFileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) f.text().then((t) => { setHtmlInput(t); setHtmlFileName(f.name); });
                  }}
                  className="hidden"
                />
              </div>
            )}
            {htmlInput && (
              <p className="mt-1.5 text-xs text-primary">{(htmlInput.length / 1024).toFixed(0)} KB HTML yüklendi</p>
            )}
          </div>

          {/* Detected media - asset uploads */}
          {showAssetUpload && detectedMedia.length > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 dark:bg-primary/10">
              <h3 className="mb-1 text-sm font-semibold text-primary">
                {detectedMedia.length} görsel/video tespit edildi
              </h3>
              <p className="mb-4 text-xs text-muted">
                HTML içinde aşağıdaki dosya referansları bulundu. Lütfen bu dosyaları yükleyin.
              </p>
              <div className="space-y-3">
                {detectedMedia.map((name) => {
                  const uploaded = assetFiles.get(name);
                  return (
                    <div key={name} className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 dark:border-border-dark dark:bg-surface-dark">
                      {uploaded ? (
                        <svg className="h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ) : (
                        <svg className="h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                      )}
                      <span className="flex-1 truncate font-mono text-xs text-gray-800 dark:text-gray-200">{name}</span>
                      {uploaded ? (
                        <span className="text-xs text-primary">{(uploaded.size / 1024).toFixed(0)} KB</span>
                      ) : (
                        <label className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-dark">
                          Yükle
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleAssetUpload(name, f);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              {missingAssets.length === 0 && (
                <p className="mt-3 text-xs font-medium text-primary">Tüm görseller yüklendi!</p>
              )}
            </div>
          )}

          {/* Thumbnail */}
          <DropZone
            label="Ana Görsel"
            sublabel="Blog kartında görünecek (.jpg, .png, .webp)"
            file={thumbnailFile}
            inputRef={thumbInputRef}
            accept=".jpg,.jpeg,.png,.webp"
            onDrop={(e) => handleFileDrop(e, setThumbnailFile, [".jpg", ".jpeg", ".png", ".webp"])}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            onClear={() => setThumbnailFile(null)}
          />

          {/* Knowledge Base */}
          <DropZone
            label="Bilgi Tabanı"
            sublabel="AI Q&A için kaynak (.pdf veya .md)"
            file={kbFile}
            inputRef={kbInputRef}
            accept=".pdf,.md,.txt"
            onDrop={(e) => handleFileDrop(e, setKbFile, [".pdf", ".md", ".txt"])}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onChange={(e) => setKbFile(e.target.files?.[0] ?? null)}
            onClear={() => setKbFile(null)}
          />

          <button
            onClick={proceedToMetadata}
            disabled={!htmlInput.trim() || isLoading}
            className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Dönüştürülüyor...
              </>
            ) : (
              <>
                Devam
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </>
            )}
          </button>
          {error && step === 1 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
          )}
        </div>
      )}

      {/* STEP 2: Metadata */}
      {step === 2 && (
        <div className="max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Makale Bilgileri</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Başlık *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug *</label>
            <div className="flex gap-2">
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light" />
              <button onClick={generateSlugFromTitle} className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary dark:border-border-dark" title="Başlıktan oluştur">Oluştur</button>
            </div>
            <p className="mt-1 text-xs text-muted">URL: /blog/{slug || "..."}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Özet</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Tarih</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Etiketler</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${tags.includes(tag) ? "bg-primary text-white" : "border border-border bg-white text-muted hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark"}`}>{tag}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(1)} className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300">Geri</button>
            <button onClick={proceedToPreview} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">
              Önizle
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </button>
          </div>
          {error && step === 2 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
          )}
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Önizleme</h2>
          <p className="text-sm text-muted">Dönüştürülmüş makale aşağıda site standardında görüntülenmektedir.</p>

          <div className="rounded-2xl border border-border-dark bg-card-dark p-6">
            <div className="mb-4 flex items-center gap-3 text-xs text-muted">
              <time>{new Date(date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</time>
              {tags.length > 0 && (
                <>
                  <span className="text-border-dark">|</span>
                  <div className="flex gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-100">{title}</h1>
            {summary && <p className="mt-2 text-gray-400">{summary}</p>}
            <hr className="my-6 border-border-dark" />
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300">Geri</button>
            <button onClick={publish} disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40">
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  Yayınla
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </>
              )}
            </button>
          </div>
          {error && step === 3 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">{error}</div>
          )}
        </div>
      )}

      {/* STEP 4: Success */}
      {step === 4 && publishSuccess && (
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h2 className="text-2xl font-bold">Yayınlandı!</h2>
          <p className="mt-2 text-muted">Makale başarıyla yayınlandı.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href={`/blog/${slug}`} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark">Makaleyi Görüntüle</Link>
            <button onClick={resetAll} className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300">Yeni Yazı Ekle</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropZone({
  label, sublabel, file, inputRef, accept, required,
  onDrop, onDragOver, onDragLeave, onChange, onClear,
}: {
  label: string; sublabel: string; file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string; required?: boolean;
  onDrop: (e: DragEvent) => void; onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 dark:border-border-dark"
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</span>
            <span className="text-xs text-muted">({(file.size / 1024).toFixed(0)} KB)</span>
            <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="ml-2 text-xs text-red-500 hover:text-red-700">Kaldır</button>
          </div>
        ) : (
          <div>
            <svg className="mx-auto mb-2 h-8 w-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            <p className="text-sm text-muted">{sublabel}</p>
            <p className="mt-1 text-xs text-muted/60">Sürükle-bırak veya tıklayarak seç</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>
    </div>
  );
}
