import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lojistik Teknolojileri Danışmanlığı",
  description: "Akıllı lojistik sistemleri, intermodal operasyon dijitalleştirme, RFID/HGS otomasyon ve filo yönetimi.",
};

const modules = [
  {
    title: "Lojistik Operasyon & Saha Otomasyonu",
    items: [
      "İntermodal, karayolu ve denizyolu operasyonlarının dijitalleştirilmesi",
      "Lojistik gelir/gider optimizasyon sistemleri",
      "UETDS entegrasyonu",
      "AI destekli otomatik araç giriş-çıkış sistemleri",
      "Konteyner tespit, RFID ve HGS/OGS entegrasyonları",
    ],
  },
  {
    title: "Araç, Filo & Kaynak Yönetimi",
    items: [
      "Özmal ve kiralık araç portföy yönetimi",
      "Sefer maliyet takibi ve verimlilik analizleri",
      "Periyodik bakım takvimleri ve yedek parça takibi",
      "Araç yakıt takip ve araç takip sistemleri entegrasyonu",
      "Şoför ve araç performans analizi",
    ],
  },
  {
    title: "Finansal Mimari & E-Dönüşüm",
    items: [
      "Operasyonla bütünleşik finans sistemi",
      "Çapraz kur yönetimi ve kârlılık analizleri",
      "Otomatik faturalama ve taşıma irsaliyesi basımı",
      "GİB e-fatura entegrasyonu",
      "Logo ve Mikro gibi ticari yazılımlarla entegrasyon",
    ],
  },
  {
    title: "İK, Güvenlik & Doküman Yönetimi",
    items: [
      "Bordrolama, fazla mesai takibi ve performans yönetimi",
      "Mobil araçlarla kapı giriş ve bekçi takip altyapısı",
      "E-imza destekli dijital arşiv",
      "Gelen-giden evrak ve görev takip sistemi (BPM)",
    ],
  },
];

const hardwareTech = [
  "RFID Sistemleri",
  "HGS/OGS Entegrasyonu",
  "Plaka Tanıma & Görüntü İşleme",
  "Arduino Uygulamaları",
  "Raspberry Pi Çözümleri",
  "Akıllı Kapı Otomasyonları",
];

export default function LojistikTeknolojileriPage() {
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
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Lojistik Teknolojileri Danışmanlığı</h1>
        <p className="mt-4 text-lg text-muted">
          Lojistik sektöründe uçtan uca dijital dönüşüm. Intermodal operasyonlardan akıllı kapı otomasyonlarına,
          filo yönetiminden finansal konsolidasyona kadar tüm süreçlerin teknoloji ile entegrasyonu.
        </p>
      </header>

      {/* Lojilog Showcase */}
      <section className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Referans Proje</span>
        <h2 className="mt-3 text-xl font-bold">Lojilog Bütünleşik ERP &amp; Otomasyon Eko-Sistemi</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Bizzat tasarlanan, test süreçleri ve modern DevOps pratikleriyle web, mobil ve API erişimleriyle
          bütünleşik yönetilen uçtan uca bir şirket yönetim sistemi. Lojistik operasyonlarını
          %100 dijitalleştiren bu platform, şu anda aktif olarak kullanılmaktadır.
        </p>
      </section>

      {/* Modules */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Çözüm Modülleri</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {modules.map((mod) => (
            <div key={mod.title} className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark">
              <h3 className="font-semibold text-primary">{mod.title}</h3>
              <ul className="mt-4 space-y-2">
                {mod.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware & IoT */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Donanım &amp; IoT Yetkinlikleri</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {hardwareTech.map((tech) => (
            <span key={tech} className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
        <h3 className="text-lg font-semibold">Lojistik operasyonlarınızı dijitalleştirmek mi istiyorsunuz?</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Intermodal, karayolu veya denizyolu operasyonlarınız için özelleştirilmiş teknoloji danışmanlığı.
        </p>
        <Link href="/links" className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-dark">
          İletişime Geçin
        </Link>
      </section>
    </div>
  );
}
