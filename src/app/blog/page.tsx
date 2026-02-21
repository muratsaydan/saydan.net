import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Yazılım, lojistik ve teknoloji üzerine makaleler.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="py-16 md:py-24">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Blog</h1>
        <p className="mt-4 text-muted">
          Yazılım mimarisi, lojistik trendleri ve sektörel analizler üzerine yazılar.
        </p>
      </section>

      <div className="mt-12 space-y-6">
        {posts.length === 0 ? (
          <p className="text-muted">Henüz yayınlanmış bir makale yok. Yakında burada olacak!</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:border-border-dark dark:bg-card-dark dark:hover:border-primary-light/30"
            >
              <div className="flex items-center gap-3 text-xs text-muted">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {post.tags.length > 0 && (
                  <>
                    <span className="text-border dark:text-border-dark">|</span>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
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
              <h2 className="mt-3 text-lg font-semibold group-hover:text-primary dark:group-hover:text-primary-light">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{post.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Devamını oku
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
