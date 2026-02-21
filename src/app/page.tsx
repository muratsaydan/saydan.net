import Link from "next/link";

const pillars = [
  {
    title: "Yazılım Proje Yönetimi",
    description: "25+ yıl deneyimle uçtan uca yazılım projelerinin mimarisi, SDLC yönetimi, test otomasyonu ve DevOps süreçleri.",
    href: "/expertise/yazilim-proje-yonetimi",
    tags: ["Sistem Analizi", "CI/CD", "Test Otomasyonu", "SDLC"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-1.007.659-1.857 1.5-2.122" />
      </svg>
    ),
  },
  {
    title: "SaaS Geliştirme",
    description: "Monolitik ERP'den SaaS'a dönüşüm deneyimi. Lojilog Lite ile kanıtlanmış ölçeklenebilir ürün mimarisi.",
    href: "/expertise/saas",
    tags: ["SaaS Mimari", "PostgreSQL", "REST API", "Bulut"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    title: "Lojistik Teknolojileri",
    description: "Akıllı lojistik sistemleri, intermodal operasyon dijitalleştirme, RFID/HGS otomasyon ve filo yönetimi.",
    href: "/expertise/lojistik-teknolojileri",
    tags: ["ERP", "IoT/RFID", "Filo Yönetimi", "Otomasyon"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.089-.504 1.09-1.124V11.25a1.5 1.5 0 00-1.5-1.5H15.75m-7.5 0v7.5m0-7.5h6.75m-6.75 0L6 6.75m0 0H3m3 0l1.5 1.5M21 12l-1.5-1.5" />
      </svg>
    ),
  },
];

const stats = [
  { value: "25+", label: "Yıl Deneyim" },
  { value: "100+", label: "Tamamlanan Proje" },
  { value: "40+", label: "Yönetilen Ekip" },
  { value: "3", label: "Kurulan Şirket" },
];

export default function HomePage() {
  return (
    <div className="py-16 md:py-24">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          Yazılım Proje Yönetimi &bull; SaaS &bull; Lojistik Teknolojileri
        </div>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Murat Saydan
          </span>
        </h1>
        <p className="mt-2 text-lg font-medium text-gray-600 dark:text-gray-400 md:text-xl">
          Yazılım Mimarı &amp; BT Direktörü | Akıllı Lojistik Sistemleri Uzmanı
        </p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          25 yılı aşkın teknoloji deneyimiyle lojistik sektöründe uçtan uca dijital dönüşüm
          mimarileri inşa ediyorum. Kurumsal yönetim tecrübesini yüksek trafikli yazılım
          mimarileri, DevOps süreçleri ve yapay zeka yetkinlikleriyle birleştiren bir &ldquo;hands-on&rdquo;
          teknik lider.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
          >
            Profesyonel Profil
          </Link>
          <Link
            href="/links"
            className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300 dark:hover:border-primary-light dark:hover:text-primary-light"
          >
            İletişime Geç
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 3 Pillars */}
      <section className="mt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Uzmanlık Alanları</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Üç temel alanda derinlemesine deneyim ve kanıtlanmış başarı hikayeleri.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:border-border-dark dark:bg-card-dark dark:hover:border-primary-light/30"
            >
              <div className="mb-5 inline-flex w-fit rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-semibold group-hover:text-primary dark:group-hover:text-primary-light">
                {pillar.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{pillar.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {pillar.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Detaylı incele
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Content */}
      <section className="mt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Öne Çıkan Projeler</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8 dark:border-border-dark dark:bg-card-dark">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Stratejik Proje</span>
            <h3 className="mt-4 text-lg font-semibold">Lojilog Bütünleşik ERP &amp; Otomasyon</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Intermodal, karayolu ve denizyolu operasyonlarını dijitalleştiren, finansal konsolidasyon,
              filo yönetimi, akıllı kapı otomasyonları ve İK modüllerini içeren uçtan uca şirket yönetim sistemi.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["C# .NET", "PostgreSQL", "REST API", "RFID", "Docker"].map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 dark:border-border-dark dark:bg-card-dark">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">AI Projesi</span>
            <h3 className="mt-4 text-lg font-semibold">SaydanChatBox</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              6 Şapka Düşünme Tekniği ile harmanlanmış yeni nesil yapay zeka asistanı.
              Tek bir asistanla değil, 6 farklı kişilik ve disiplindeki asistanla etkileşim.
              Oyunlaştırma teorisinin kullanıldığı SaaS uygulaması.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["LLM", "AI", "SaaS", "Gamification", "6 Thinking Hats"].map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">Birlikte çalışalım</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
          Yazılım proje yönetimi, SaaS geliştirme veya lojistik teknolojileri alanında
          danışmanlık mı arıyorsunuz? Benimle iletişime geçin.
        </p>
        <Link
          href="/links"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-lg transition-all hover:bg-gray-50"
        >
          İletişim &amp; Bağlantılar
        </Link>
      </section>
    </div>
  );
}
