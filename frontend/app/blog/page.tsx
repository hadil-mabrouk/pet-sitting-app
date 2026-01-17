"use client"

import Link from "next/link"
import posts from "@/content/blog/posts.json"

export default function BlogIndex() {
  const ordered = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <div className="min-h-screen bg-background px-4 py-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
        <p className="text-muted-foreground">Conseils rapides pour propriétaires et gardiens.</p>
      </div>
      <div className="space-y-4">
        {ordered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
            <h2 className="text-xl font-semibold text-foreground">{post.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
