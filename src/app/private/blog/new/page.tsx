"use client";

import { useState, useRef, useCallback, useMemo, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";

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

const ASSET_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg",
  ".mp4", ".webm",
];

export default function NewBlogPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [assetFiles, setAssetFiles] = useState<Map<string, File>>(new Map());
  const [zipInfo, setZipInfo] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [kbFile, setKbFile] = useState<File | null>(null);

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

  const zipInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const kbInputRef = useRef<HTMLInputElement>(null);

  // Blob URLs for preview images
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

  const handleFileDrop = useCallback(
    (
      e: DragEvent,
      setter: (f: File | null) => void,
      accept: string[]
    ) => {
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

  const extractZip = async (file: File) => {
    setZipFile(file);
    setError("");
    setZipInfo("");
    setHtmlContent("");
    setAssetFiles(new Map());

    try {
      const zip = await JSZip.loadAsync(file);
      let foundHtml = "";
      const assets = new Map<string, File>();
      let htmlCount = 0;
      let assetCount = 0;

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        const fileName = relativePath.split("/").pop() || relativePath;
        const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

        if ((ext === ".html" || ext === ".htm") && !foundHtml) {
          foundHtml = await zipEntry.async("string");
          htmlCount++;
        } else if (ASSET_EXTENSIONS.includes(ext)) {
          const blob = await zipEntry.async("blob");
          assets.set(fileName, new File([blob], fileName, { type: blob.type || `image/${ext.slice(1)}` }));
          assetCount++;
        }
      }

      if (!foundHtml) {
        setError("ZIP dosyasında HTML bulunamadı.");
        setZipFile(null);
        return;
      }

      setHtmlContent(foundHtml);
      setAssetFiles(assets);
      setZipInfo(`${htmlCount} HTML, ${assetCount} görsel/video bulundu`);
    } catch {
      setError("ZIP dosyası okunamadı.");
      setZipFile(null);
    }
  };

  const handleZipDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      extractZip(file);
    }
  }, []);

  // Step 1 → 2: transform HTML, detect title, generate slug
  const proceedToMetadata = async () => {
    if (!htmlContent) {
      setError("ZIP dosyası yükleyin (HTML içermeli).");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/private/blog/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawHtml: htmlContent }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
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
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 → 3: proceed to preview
  const proceedToPreview = () => {
    if (!title.trim()) {
      setError("Başlık gerekli.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug gerekli.");
      return;
    }
    setError("");
    setStep(3);
  };

  // Step 3 → 4: publish
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

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
      if (kbFile) {
        formData.append("knowledgeBase", kbFile);
      }
      assetFiles.forEach((file) => {
        formData.append("assets", file, file.name);
      });

      const res = await fetch("/api/private/blog/publish", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || "Yayınlama hatası");
        }
        throw new Error(`Sunucu hatası (${res.status})`);
      }

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Yayınlama hatası");
      }

      setPublishSuccess(true);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const generateSlugFromTitle = () => {
    const trMap: Record<string, string> = {
      ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
      Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
    };
    const s = title
      .toLowerCase()
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (ch) => trMap[ch] || ch)
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    setSlug(s);
  };

  return (
    <div className="py-12">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/private"
          className="text-sm text-muted transition-colors hover:text-primary"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Yeni Blog Yazısı
        </h1>
      </div>

      {/* Steps indicator */}
      <div className="mb-10 flex items-center gap-2">
        {[
          { n: 1, label: "Yükle" },
          { n: 2, label: "Metadata" },
          { n: 3, label: "Önizle" },
          { n: 4, label: "Yayınla" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step >= n
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {step > n ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                n
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                step >= n ? "text-primary" : "text-muted"
              }`}
            >
              {label}
            </span>
            {n < 4 && (
              <div
                className={`mx-1 h-px w-8 ${
                  step > n ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Dosyaları Yükleyin</h2>

          {/* ZIP Content Package */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              İçerik Paketi <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handleZipDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => zipInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 dark:border-border-dark"
            >
              {zipFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {zipFile.name}
                    </span>
                    <span className="text-xs text-muted">
                      ({(zipFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setZipFile(null);
                        setHtmlContent("");
                        setAssetFiles(new Map());
                        setZipInfo("");
                      }}
                      className="ml-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Kaldır
                    </button>
                  </div>
                  {zipInfo && (
                    <p className="text-xs text-primary">{zipInfo}</p>
                  )}
                  {assetFiles.size > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {Array.from(assetFiles.keys()).map((name) => (
                        <span key={name} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <svg className="mx-auto mb-2 h-8 w-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <p className="text-sm text-muted">HTML + görseller/videolar içeren ZIP paketi (.zip)</p>
                  <p className="mt-1 text-xs text-muted/60">
                    Sürükle-bırak veya tıklayarak seç
                  </p>
                </div>
              )}
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) extractZip(f);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <DropZone
            label="Ana Görsel"
            sublabel="Blog kartında ve üst kısımda görünecek (.jpg, .png, .webp)"
            file={thumbnailFile}
            inputRef={thumbInputRef}
            accept=".jpg,.jpeg,.png,.webp"
            onDrop={(e) =>
              handleFileDrop(e, setThumbnailFile, [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
              ])
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onChange={(e) =>
              setThumbnailFile(e.target.files?.[0] ?? null)
            }
            onClear={() => setThumbnailFile(null)}
          />

          {/* Knowledge Base */}
          <DropZone
            label="Bilgi Tabanı"
            sublabel="AI Q&A için kaynak (.pdf veya .md)"
            file={kbFile}
            inputRef={kbInputRef}
            accept=".pdf,.md,.txt"
            onDrop={(e) =>
              handleFileDrop(e, setKbFile, [".pdf", ".md", ".txt"])
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onChange={(e) =>
              setKbFile(e.target.files?.[0] ?? null)
            }
            onClear={() => setKbFile(null)}
          />

          <button
            onClick={proceedToMetadata}
            disabled={!htmlContent || isLoading}
            className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Dönüştürülüyor...
              </>
            ) : (
              <>
                Devam
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
          {error && step === 1 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Metadata */}
      {step === 2 && (
        <div className="max-w-2xl space-y-6">
          <h2 className="text-lg font-semibold">Makale Bilgileri</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Başlık *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light"
              />
              <button
                onClick={generateSlugFromTitle}
                className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary dark:border-border-dark"
                title="Başlıktan oluştur"
              >
                Oluştur
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              URL: /blog/{slug || "..."}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Özet
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tarih
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-border-dark dark:bg-surface-dark dark:focus:border-primary-light"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Etiketler
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    tags.includes(tag)
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-muted hover:border-primary hover:text-primary dark:border-border-dark dark:bg-surface-dark"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300"
            >
              Geri
            </button>
            <button
              onClick={proceedToPreview}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Önizle
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
          {error && step === 2 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Önizleme</h2>
          <p className="text-sm text-muted">
            Dönüştürülmüş makale aşağıda site standardında görüntülenmektedir.
          </p>

          <div className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
            <div className="mb-4 flex items-center gap-3 text-xs text-muted">
              <time>{new Date(date).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</time>
              {tags.length > 0 && (
                <>
                  <span className="text-border">|</span>
                  <div className="flex gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {summary && <p className="mt-2 text-muted">{summary}</p>}
            <hr className="my-6 border-border dark:border-border-dark" />
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300"
            >
              Geri
            </button>
            <button
              onClick={publish}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-40"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  Yayınla
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
          {error && step === 3 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: Success */}
      {step === 4 && publishSuccess && (
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Yayınlandı!</h2>
          <p className="mt-2 text-muted">
            Makale başarıyla yayınlandı.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href={`/blog/${slug}`}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Makaleyi Görüntüle
            </Link>
            <button
              onClick={() => {
                setStep(1);
                setZipFile(null);
                setHtmlContent("");
                setAssetFiles(new Map());
                setZipInfo("");
                setThumbnailFile(null);
                setKbFile(null);
                setTitle("");
                setSummary("");
                setTags([]);
                setSlug("");
                setTransformedHtml("");
                setExternalScripts([]);
                setPublishSuccess(false);
              }}
              className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300"
            >
              Yeni Yazı Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* DropZone Component */
function DropZone({
  label,
  sublabel,
  file,
  inputRef,
  accept,
  required,
  onDrop,
  onDragOver,
  onDragLeave,
  onChange,
  onClear,
}: {
  label: string;
  sublabel: string;
  file: File | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  required?: boolean;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50 dark:border-border-dark"
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {file.name}
            </span>
            <span className="text-xs text-muted">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="ml-2 text-xs text-red-500 hover:text-red-700"
            >
              Kaldır
            </button>
          </div>
        ) : (
          <div>
            <svg className="mx-auto mb-2 h-8 w-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-muted">{sublabel}</p>
            <p className="mt-1 text-xs text-muted/60">
              Sürükle-bırak veya tıklayarak seç
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
