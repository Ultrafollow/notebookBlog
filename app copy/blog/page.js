import Link from 'next/link'
import { getCategoriesWithPosts } from '@/app/lib/utils'

export default async function BlogHome() {
  const categories = await getCategoriesWithPosts()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">所有分类</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map(({ category, posts }) => (
          <div key={category} className="border rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">
              {decodeURIComponent(category)}
            </h2>
            <div className="space-y-2">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${category}/${post.slug}`}
                  className="block p-2 hover:bg-gray-50 rounded"
                >
                  {post.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}