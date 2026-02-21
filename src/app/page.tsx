import Link from "next/link";

const highlights = [
  {
    title: "Yazılım Projeleri",
    description: "Modern web teknolojileri ile geliştirdiğim projeler ve açık kaynak katkılar.",
    href: "/links",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "Blog & Makaleler",
    description: "Yazılım mimarisi, lojistik trendleri ve sektörel analizler.",
    href: "/blog",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "SaydanChatBox",
    description: "Yapay zeka destekli kişisel sanal asistan. Yakında aktif olacak.",
    href: "#",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="py-16 md:py-24">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          Yazılım &amp; Lojistik
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Merhaba, ben{" "}
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Saydan
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Yazılım geliştirme ve lojistik alanlarında çalışıyorum. Bu site benim dijital merkezim — projelerim, 
          makalelerim ve tüm profesyonel çalışmalarım burada buluşuyor.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
          >
            Hakkımda
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-primary hover:text-primary dark:border-border-dark dark:text-gray-300 dark:hover:border-primary-light dark:hover:text-primary-light"
          >
            Blog Yazıları
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:border-border-dark dark:bg-card-dark dark:hover:border-primary-light/30"
          >
            <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-12 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">Birlikte çalışalım</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/80">
          Bir proje fikriniz mi var? Yazılım veya lojistik alanında danışmanlık mı arıyorsunuz?
          Benimle iletişime geçin.
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
