import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımda",
  description: "Saydan hakkında — Yazılım geliştirici ve lojistik profesyoneli.",
};

const experience = [
  {
    role: "Yazılım Geliştirici",
    company: "Freelance / Kendi Projeleri",
    period: "2024 — Günümüz",
    description:
      "Modern web teknolojileri (Next.js, React, TypeScript) ile uygulama geliştirme. Kişisel projeler ve açık kaynak çalışmalar.",
  },
];

const skills = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", items: ["Node.js", "Python", "REST API"] },
  { category: "DevOps", items: ["Git", "Docker", "CI/CD", "Linux"] },
  { category: "Lojistik", items: ["Tedarik Zinciri", "Depo Yönetimi", "Operasyon Planlama"] },
];

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      {/* Header */}
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hakkımda</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Yazılım ve lojistik dünyalarının kesişiminde çalışan bir profesyonelim.
          Teknolojiyi kullanarak karmaşık operasyonel sorunlara pratik çözümler üretmeyi seviyorum.
          Sürekli öğreniyor, üretiyor ve paylaşıyorum.
        </p>
      </section>

      {/* Skills */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Yetenekler &amp; Teknolojiler</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group) => (
            <div
              key={group.category}
              className="rounded-2xl border border-border bg-card p-6 dark:border-border-dark dark:bg-card-dark"
            >
              <h3 className="text-sm font-semibold text-primary">{group.category}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Deneyim</h2>
        <div className="mt-8 space-y-8">
          {experience.map((exp) => (
            <div
              key={exp.role + exp.company}
              className="relative border-l-2 border-primary/30 pl-6"
            >
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white dark:bg-surface-dark" />
              <p className="text-xs font-medium text-primary">{exp.period}</p>
              <h3 className="mt-1 text-base font-semibold">{exp.role}</h3>
              <p className="text-sm text-muted">{exp.company}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Download CV */}
      <section className="mt-16">
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
