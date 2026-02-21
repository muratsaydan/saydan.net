import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SaaS Geliştirme",
  description: "Monolitik ERP'den SaaS'a dönüşüm deneyimi. Ölçeklenebilir bulut tabanlı ürün mimarisi.",
};

const saasExperience = [
  {
    title: "Lojilog ERP → Lojilog Lite (SaaS)",
    description: "Yıllarca geliştirilen monolitik ERP sisteminin çoklu kiracı (multi-tenant) SaaS modeline dönüştürülmesi. PostgreSQL geçişi, REST API katmanı, modern veritabanı mimarisine geçiş.",
    status: "Aktif",
  },
  {
    title: "SaydanChatBox",
    description: "6 Şapka Düşünme Tekniği ile harmanlanmış AI asistan. LLM tabanlı çoklu kişilik sistemi, oyunlaştırma teorisi entegrasyonu. SaaS olarak piyasaya çıkma aşamasında.",
    status: "Test Aşamasında",
  },
  {
    title: "Rivea Beauty E-ticaret",
    description: "Shopify tabanlı uçtan uca e-ticaret operasyonu. Dijital pazarlama yönetimi, sipariş otomasyonu ve müşteri deneyimi optimizasyonu.",
    status: "Aktif",
  },
];

const saasCapabilities = [
  "Multi-Tenant Mimari Tasarımı",
  "Monolitten SaaS'a Dönüşüm",
  "API-First Geliştirme",
  "Veritabanı Migrasyon Stratejileri",
  "Abonelik & Lisans Yönetimi",
  "Bulut Dağıtım (AWS, Azure, Hetzner)",
  "CI/CD Pipeline Kurulumu",
  "Performans & Ölçeklenebilirlik",
];

const techStack = [
  "C# .NET MVC", "REST API", "PostgreSQL", "Docker",
  "GitHub Actions", "Next.js", "TypeScript", "Python",
  "LLM / AI", "Shopify", "AWS", "Azure",
];

export default function SaasPage() {
  return (
    <div className="py-16 md:py-24">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Ana Sayfa
      </Link>

      <header className="mt-8 max-w-3xl">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Uzmanlık Alanı</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">SaaS Geliştirme</h1>
        <p className="mt-4 text-lg text-muted">
          Monolitik kurumsal uygulamaları modern, ölçeklenebilir SaaS ürünlerine dönüştürme deneyimi.
          Lojilog ERP&apos;nin SaaS modeline başarılı geçişi ve SaydanChatBox gibi sıfırdan SaaS ürün geliştirme.
        </p>
      </header>

      {/* SaaS Products */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">SaaS Ürünleri &amp; Projeleri</h2>
        <div className="mt-8 space-y-6">
          {saasExperience.map((product) => (
            <div key={product.title} className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold">{product.title}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  product.status === "Aktif"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">SaaS Yetkinlikleri</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {saasCapabilities.map((cap) => (
            <div key={cap} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 dark:border-border-dark dark:bg-card-dark">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-sm font-medium">{cap}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Teknoloji Yığını</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <span key={tech} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium dark:border-border-dark dark:bg-card-dark">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-semibold">SaaS ürününüzü birlikte inşa edelim</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Mevcut sisteminizi SaaS&apos;a dönüştürmek veya sıfırdan bir SaaS ürün geliştirmek için iletişime geçin.
        </p>
        <Link href="/links" className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark">
          İletişime Geçin
        </Link>
      </section>
    </div>
  );
}
