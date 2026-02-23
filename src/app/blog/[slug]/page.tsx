import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { auth, ALLOWED_EMAILS } from "@/lib/auth";
import RichBlogContent from "@/components/RichBlogContent";
import BlogQA from "@/components/BlogQA";
import BlogDeleteButton from "@/components/BlogDeleteButton";
import BlogArticleReader from "@/components/BlogArticleReader";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const session = await auth();
  const isAdmin = ALLOWED_EMAILS.includes(session?.user?.email ?? "");

  const hasScripts = post.externalScripts.length > 0 ||
    post.content.includes("data-blog-script");

  return (
    <article className="py-16 md:py-24">
      <div className={hasScripts ? "mx-auto max-w-5xl" : "mx-auto max-w-3xl"}>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
        >
          <svg
            className="h-4 w-4"
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
          Tüm yazılar
        </Link>

        <header className="mt-8">
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
                <span className="text-border-dark">|</span>
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
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-100 md:text-4xl">
            {post.title}
          </h1>
          {post.summary && (
            <p className="mt-4 text-lg text-gray-400">{post.summary}</p>
          )}
        </header>

        <hr className="my-8 border-border-dark" />

        {hasScripts ? (
          <RichBlogContent
            content={post.content}
            externalScripts={post.externalScripts}
          />
        ) : (
          <div
            className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-100 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-p:text-gray-300 prose-li:text-gray-300 prose-a:text-primary-light prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-100 prose-code:rounded prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary-light prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl prose-img:w-full prose-img:max-w-full prose-img:h-auto"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {post.knowledgeBase && <BlogQA slug={post.slug} />}

        {post.knowledgeBase && (
          <BlogArticleReader content={post.knowledgeBase} />
        )}

        <hr className="my-12 border-border-dark" />

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-xl border border-border-dark px-6 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-primary-light hover:text-primary-light"
        >
          <svg
            className="h-4 w-4"
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
          Tüm yazılara dön
        </Link>

        {isAdmin && (
          <div className="mt-8">
            <BlogDeleteButton slug={post.slug} />
          </div>
        )}
      </div>
    </article>
  );
}
