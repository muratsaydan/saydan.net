import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımda",
  description: "Murat Saydan — 25+ yıl deneyimli Yazılım Mimarı & BT Direktörü. ODTÜ İstatistik mezunu.",
};

const experience = [
  {
    role: "BT ve Yazılım Müdürü",
    company: "Ufuk İntermodal Lojistik A.Ş.",
    location: "Mersin",
    period: "2016 — Günümüz",
    highlights: [
      "5 kişilik teknoloji ekibinin liderliği ve SDLC süreçlerinin yönetimi",
      "Lojistik operasyonları %100 dijitalleştiren Lojilog ERP mimarisinin geliştirilmesi",
      "Akıllı kapı otomasyonları, RFID ve HGS/OGS entegrasyonları",
    ],
  },
  {
    role: "Kurucu Ortak",
    company: "Lojilog Bilişim Ltd. Şti.",
    location: "Mersin",
    period: "2022 — Günümüz",
    highlights: [
      "ERP çözümünün SaaS (Lojilog Lite) modeline dönüştürülmesi",
      "Modern veritabanı (PostgreSQL) geçişi ve REST API katmanı",
    ],
  },
  {
    role: "BT Yönetici Yardımcısı — Test Ortamları Koordinatörü",
    company: "Akbank T.A.Ş.",
    location: "İstanbul",
    period: "1998 — 2009",
    highlights: [
      "40 kişilik operasyon ekibinin yönetimi",
      "Kritik bankacılık sistemlerinde test ortamları koordinasyonu",
      "Performans iyileştirme araçlarının kodlanması",
    ],
  },
];

const education = [
  {
    title: "Yüksek Trafikli Yazılım Mimarisi (Sertifikalı)",
    institution: "Teedo",
    period: "2024–2025",
    description: "Ölçeklenebilir mimariler, performans optimizasyonu ve DevOps",
  },
  {
    title: "Yapay Zeka ve Girişimcilik",
    institution: "Komünite Girişimcilik Ekosistemi",
    period: "",
    description: "AI tabanlı ürün geliştirme metodolojileri",
  },
  {
    title: "IBM Certified Database Administrator — DB2",
    institution: "IBM Türkiye",
    period: "2007",
    description: "Veritabanı yöneticilik sertifikası",
  },
  {
    title: "Lisans — İstatistik",
    institution: "Orta Doğu Teknik Üniversitesi (ODTÜ)",
    period: "1995 Mezunu",
    description: "",
  },
];

const skills = [
  { category: "Mimari & DevOps", items: ["Yüksek Trafikli Yazılım Mimarileri", "SaaS Tasarımı", "CI/CD", "GitHub Actions", "Docker", "Sistem Analizi"] },
  { category: "Yazılım & Veritabanı", items: ["C#", ".NET MVC / MAUI", "REST API", "Python", "SQL", "PostgreSQL", "IBM DB2"] },
  { category: "AI & İnovasyon", items: ["AI-Assisted Development", "Vibe Coding", "LLM Entegrasyonları", "Yapay Zeka Uygulama Entegrasyonları"] },
  { category: "Donanım & Otomasyon", items: ["RFID", "HGS/OGS", "Plaka Tanıma", "Görüntü İşleme", "Arduino", "Raspberry Pi"] },
  { category: "Bulut Teknolojileri", items: ["AWS", "Azure", "Google Cloud", "Hetzner", "Digital Ocean"] },
  { category: "İşletim Sistemleri", items: ["Windows", "Linux", "Unix", "Android", "MVS / OS 390"] },
];

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      {/* Header */}
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Murat Saydan</h1>
        <p className="mt-2 text-lg font-medium text-primary">
          Yazılım Mimarı &amp; BT Direktörü | Akıllı Lojistik Sistemleri Uzmanı
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted">
          25 yılı aşkın teknoloji tecrübesine sahip, lojistik sektöründe uçtan uca dijital dönüşüm
          mimarileri inşa eden Sistem Analisti ve Yazılım Geliştiricisi. Akbank&apos;taki kurumsal yönetim
          tecrübesini; yüksek trafikli yazılım mimarileri, DevOps süreçleri ve yapay zeka (AI)
          yetkinlikleriyle birleştirmiştir. Donanım entegrasyonundan finansal konsolidasyona, otomatik
          test süreçlerinden bulut dağıtıma kadar geniş bir spektrumda çözüm üreten &ldquo;hands-on&rdquo; bir
          teknik yönetici.
        </p>
      </section>

      {/* Skills */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Teknik Uzmanlık &amp; Modern Mühendislik</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark"
            >
              <h3 className="text-sm font-semibold text-primary">{group.category}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-muted">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Mesleki Deneyim</h2>
        <div className="mt-8 space-y-10">
          {experience.map((exp) => (
            <div key={exp.role + exp.company} className="relative border-l-2 border-primary/30 pl-6">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white dark:bg-surface-dark" />
              <p className="text-xs font-medium text-primary">{exp.period}</p>
              <h3 className="mt-1 text-base font-semibold">{exp.role}</h3>
              <p className="text-sm text-muted">{exp.company} — {exp.location}</p>
              <ul className="mt-3 space-y-1.5">
                {exp.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Eğitim &amp; Sertifikalar</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {education.map((edu) => (
            <div
              key={edu.title}
              className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark"
            >
              <h3 className="font-semibold">{edu.title}</h3>
              <p className="mt-1 text-sm text-primary">{edu.institution}{edu.period ? ` (${edu.period})` : ""}</p>
              {edu.description && <p className="mt-2 text-sm text-muted">{edu.description}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Download CV */}
      <section className="mt-16 flex flex-col gap-4 sm:flex-row">
        <a
          href="/files/cv.pdf"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
          download
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          CV İndir (PDF)
        </a>
      </section>
    </div>
  );
}
