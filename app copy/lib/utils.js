import path from 'path'
import fs from 'fs/promises'
import querystring from 'querystring'

// 获取所有分类名称（用于导航栏）
export async function getCategories() {
  const contentDir = path.join(process.cwd(), 'content')
  try {
    const items = await fs.readdir(contentDir)
    
    const validCategories = await Promise.all(
      items.map(async item => {
        const itemPath = path.join(contentDir, item)
        try {
          const stat = await fs.stat(itemPath)
          return stat.isDirectory() ? querystring.unescape(item) : null
        } catch {
          return null
        }
      })
    )

    return validCategories.filter(Boolean)
  } catch (error) {
    console.error('获取分类失败:', error)
    return []
  }
}

// 获取带文章的分类数据（用于首页）
export async function getCategoriesWithPosts() {
  const contentDir = path.join(process.cwd(), 'content')
  
  try {
    const categories = await fs.readdir(contentDir)
    
    const results = await Promise.all(
      categories.map(async category => {
        const decodedCategory = querystring.unescape(category)
        const categoryPath = path.join(contentDir, decodedCategory)
        
        try {
          const files = await fs.readdir(categoryPath)
          const posts = files
            .filter(file => ['.md', '.mdx'].includes(path.extname(file)))
            .map(file => ({
              slug: path.parse(file).name,
              title: path.parse(file).name.replace(/-/g, ' '), // 从文件名生成标题
              category: decodedCategory
            }))

          return {
            category: encodeURIComponent(decodedCategory),
            posts
          }
        } catch {
          return null
        }
      })
    )

    return results.filter(Boolean)
  } catch (error) {
    console.error('获取分类失败:', error)
    return []
  }
}