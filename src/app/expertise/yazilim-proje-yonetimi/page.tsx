import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Yazılım Proje Yönetimi",
  description: "25+ yıl deneyimle yazılım proje yönetimi, sistem analizi, test otomasyonu ve DevOps süreçleri.",
};

const capabilities = [
  {
    title: "Sistem Analizi & Mimari Tasarım",
    description: "İş gereksinimlerinden teknik mimariye uzanan sürecin tamamını yönetme. Yüksek trafikli, ölçeklenebilir sistem tasarımları.",
  },
  {
    title: "SDLC & Proje Yönetimi",
    description: "Yazılım geliştirme yaşam döngüsünün tüm aşamalarında liderlik. 5-40 kişilik ekiplerin yönetimi.",
  },
  {
    title: "Test Otomasyonu & Kalite Güvence",
    description: "Unit test, entegrasyon testleri, Selenium tabanlı otomasyon yapıları. Akbank'ta kritik bankacılık sistemlerinde test koordinasyonu.",
  },
  {
    title: "DevOps & CI/CD",
    description: "GitHub Actions, Docker ile sürekli entegrasyon ve dağıtım. Buluttan on-premise'e kadar deployment stratejileri.",
  },
  {
    title: "AI-Assisted Development",
    description: "Vibe Coding yaklaşımıyla yapay zeka destekli geliştirme. LLM entegrasyonları ve AI tabanlı ürün geliştirme metodolojileri.",
  },
];

const techStack = [
  { category: "Diller", items: ["C#", "Python", "SQL", "JavaScript/TypeScript"] },
  { category: "Framework", items: [".NET MVC", "MAUI", "WebForms", "REST API", "Next.js"] },
  { category: "Veritabanı", items: ["PostgreSQL", "SQL Server", "IBM DB2"] },
  { category: "DevOps", items: ["Docker", "GitHub Actions", "CI/CD", "Linux"] },
  { category: "Bulut", items: ["AWS", "Azure", "Google Cloud", "Hetzner"] },
  { category: "Test", items: ["Selenium", "Unit Test", "Entegrasyon Testleri"] },
];

const track = [
  { period: "1998–2009", role: "BT Yönetici Yrd. — Test Ortamları Koordinatörü", company: "Akbank T.A.Ş.", highlight: "40 kişilik operasyon ekibi yönetimi, kritik bankacılık sistemleri" },
  { period: "2016–Günümüz", role: "BT ve Yazılım Müdürü", company: "Ufuk İntermodal Lojistik A.Ş.", highlight: "5 kişilik ekip liderliği, Lojilog ERP mimarisinin geliştirilmesi" },
  { period: "2022–Günümüz", role: "Kurucu Ortak", company: "Lojilog Bilişim Ltd. Şti.", highlight: "ERP'nin SaaS modeline dönüştürülmesi" },
];

export default function YazilimProjeYonetimiPage() {
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
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Yazılım Proje Yönetimi</h1>
        <p className="mt-4 text-lg text-muted">
          25 yılı aşkın deneyimle yazılım projelerinin analiz, tasarım, geliştirme, test ve
          dağıtım süreçlerini uçtan uca yönetiyorum. Kurumsal bankacılıktan lojistik
          ERP sistemlerine kadar geniş bir yelpazede kanıtlanmış başarılar.
        </p>
      </header>

      {/* Capabilities */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Yetkinlikler</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {capabilities.map((cap) => (
            <div key={cap.title} className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-semibold text-primary">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{cap.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Teknoloji Yığını</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">{group.category}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium dark:border-border-dark dark:bg-card-dark">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track Record */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Kariyer İzi</h2>
        <div className="mt-8 space-y-8">
          {track.map((item) => (
            <div key={item.period} className="relative border-l-2 border-primary/30 pl-6">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white dark:bg-surface-dark" />
              <p className="text-xs font-medium text-primary">{item.period}</p>
              <h3 className="mt-1 font-semibold">{item.role}</h3>
              <p className="text-sm text-muted">{item.company}</p>
              <p className="mt-1 text-sm text-muted">{item.highlight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-semibold">Yazılım projeleriniz için deneyimli bir lider mi arıyorsunuz?</h3>
        <Link href="/links" className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark">
          İletişime Geçin
        </Link>
      </section>
    </div>
  );
}
