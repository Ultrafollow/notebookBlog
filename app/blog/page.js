// app/blog/page.js
import { Suspense } from 'react'
import { ListLayoutSkeleton } from '@/components/ui/BlogSkeleton'
import ListLayout from '@/Layouts/ListLayout'
import { getCategoriesWithPosts } from '@/app/lib/utils'

const POSTS_PER_PAGE = 5

export default async function BlogPage() {
  // 获取所有分类数据
  const categoriesData = await getCategoriesWithPosts()
 
  // 处理文章数据
  const allPosts = categoriesData
  .flatMap(cat => 
    cat.posts.map(post => ({
      ...post,
      path: `${decodeURIComponent(cat.category)}/${post.slug}`,
      date: post.date || new Date().toISOString()
    }))
  )
  // 新增排序逻辑
  .sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA  // 降序排列（最新在前）
  })
  // console.log(allPosts)
  // 首页显示第一页内容
  const initialDisplayPosts = allPosts.slice(0, POSTS_PER_PAGE)
 
  // 分页器配置
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(allPosts.length / POSTS_PER_PAGE)
  }
 
  return (
    <Suspense fallback={<ListLayoutSkeleton />}>
      <ListLayout
        posts={allPosts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
    </Suspense>
  )
}