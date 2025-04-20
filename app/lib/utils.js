import path from 'path'
import fs from 'fs/promises'
import querystring from 'querystring'
import matter from 'gray-matter'

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
      categories.map(async (categoryDir) => {
        try {
          const decodedCategory = querystring.unescape(categoryDir)
          const categoryPath = path.join(contentDir, categoryDir)
          const files = await fs.readdir(categoryPath)
 
          const posts = await Promise.all(
            files
              .filter(file => ['.md', '.mdx'].includes(path.extname(file)))
              .map(async (file) => {
                try {
                  const filePath = path.join(categoryPath, file)
                  const fileContent = await fs.readFile(filePath, 'utf-8')
                  const { data, content } = matter(fileContent)
 
                  return {
                    slug: path.parse(file).name,
                    title: data.title || path.parse(file).name.replace(/-/g, ' '),
                    date: data.date || new Date().toISOString(),
                    tags: data.tags || [],
                    summary: data.summary || '',
                    content,
                    category: decodedCategory
                  }
                } catch (error) {
                  console.error(`解析文件失败: ${file}`, error)
                  return null
                }
              })
          )
 
          return {
            category: encodeURIComponent(decodedCategory),
            posts: posts.filter(Boolean).sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            )
          }
        } catch (error) {
          console.error(`读取分类失败: ${categoryDir}`, error)
          return null
        }
      })
    )
 
    return results.filter(Boolean)
  } catch (error) {
    console.error('初始化失败:', error)
    return []
  }
}
