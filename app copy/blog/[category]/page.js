import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoriesWithPosts } from '../../lib/utils'

export async function generateStaticParams() {
  const categories = await getCategoriesWithPosts()
  return categories.map(({ category }) => ({ category}))
}

export default async function CategoryPage({ params }) {
  // 对路由参数进行解码
  const {category} = await params
  const decodedCategory = decodeURIComponent(category)
  // 获取数据时传递解码后的分类名称
  const categories = await getCategoriesWithPosts()
  const currentCategory = categories.find(c => decodeURIComponent(c.category) === decodedCategory)

  if (!currentCategory) return notFound()

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        {decodedCategory} 分类文章
      </h1>
      <div className="space-y-2">
        {currentCategory.posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${category}/${post.slug}`}
            className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">点击阅读完整内容</p>
          </Link>
        ))}
      </div>
    </div>
  )
}