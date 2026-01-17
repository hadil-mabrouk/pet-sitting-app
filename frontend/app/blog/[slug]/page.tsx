import posts from "@/content/blog/posts.json"
import Link from "next/link"

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Props) {
  const slug = decodeURIComponent(params.slug || "").toLowerCase()
  const post = posts.find((p) => (p.slug || "").toLowerCase() === slug)
  if (!post) return { title: "Article introuvable" }
  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default function BlogPost({ params }: Props) {
  const slug = decodeURIComponent(params.slug || "").toLowerCase()
  const post = posts.find((p) => (p.slug || "").toLowerCase() === slug)
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Article introuvable</p>
          <Link href="/blog" className="text-primary underline">
            Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 max-w-3xl mx-auto space-y-4">
      <Link href="/blog" className="text-primary underline text-sm">
        ← Retour
      </Link>
      <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
      <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
      <p className="text-muted-foreground">{post.excerpt}</p>
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-border">
          <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
        </div>
      )}
      <div className="text-foreground whitespace-pre-line leading-relaxed">{post.body}</div>
    </div>
  )
}
