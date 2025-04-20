import { bundleMDX } from 'mdx-bundler'
import { getMDXComponent } from 'mdx-bundler/client'
import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { notFound } from 'next/navigation'
import querystring from 'querystring'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import toc from "@jsdevtools/rehype-toc";
import remarkCodeTitles from "remark-flexible-code-titles";
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// 获取解码后的分类目录
async function getAllCategories() {
  const contentDir = path.join(process.cwd(), 'content')
  try {
    const items = await fs.readdir(contentDir)

    const validCategories = await Promise.all(
      items.map(async item => {
        const itemPath = path.join(contentDir, item)
        try {
          const stat = await fs.stat(itemPath)
          return stat.isDirectory() ? item : null
        } catch {
          return null
        }
      })
    )

    return validCategories.filter(Boolean)
  } catch (error) {
    console.error('获取分类目录失败:', error)
    return []
  }
}

// // 生成静态路径
export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content')
  const categories = await getAllCategories()
  
  const allParams = await Promise.all(
    categories.map(async (category) => {
      const decodedCategory = querystring.unescape(category)
      const categoryDir = path.join(contentDir, decodedCategory)
      try {
        const files = await fs.readdir(categoryDir)
        return files
          .filter(file => ['.md', '.mdx'].includes(path.extname(file)))
          .map(file => ({
            category: decodedCategory,
            slug: path.parse(file).name
          }))
      } catch (error) {
        console.error(`处理分类 ${decodedCategory} 失败:`, error)
        return []
      }
    })
  )

  return allParams.flat()
}

async function getPost(params) {
  // 解码 URL 参数
  const decodedCategory = querystring.unescape(params.category)
  const decodedSlug = querystring.unescape(params.slug)
  
  try {
    // 验证分类目录有效性
    const validCategories = await getAllCategories()
    if (!validCategories.includes(decodedCategory)) {
      throw new Error('无效的分类目录')
    }

    // 构建文件路径（优先尝试 .mdx）
    const basePath = path.join(
      process.cwd(),
      'content',
      decodedCategory,
      decodedSlug
    )

    let fileExt = '.md'
    try {
      await fs.access(`${basePath}.mdx`)
      fileExt = '.mdx'
    } catch {
      fileExt = '.md'
    }

    const filePath = `${basePath}${fileExt}`

    // 读取文件内容
    const source = await fs.readFile(filePath, 'utf8')
    const { content, data } = matter(source)
    // 编译 MDX 内容
    const { code } = await bundleMDX({
      source: content,
      mdxOptions: (options, frontmatter) => {
        options.remarkPlugins = [...(options.remarkPlugins ?? []), ...[remarkGfm, remarkCodeTitles]]
        options.rehypePlugins = [...(options.rehypePlugins ?? []), ...[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
          [rehypePrismPlus, { ignoreMissing: false, showLineNumbers: true}],
          toc,
        ]]
        return options
      },
      esbuildOptions: options => {
        options.outdir = path.join(process.cwd(), 'public')
        options.write = true
        return options
      }
    })

    return {
      code,
      frontmatter: {
        ...data,
        slug: decodedSlug,
        category: decodedCategory,
        date: new Date(data.date ?? Date.now()).toLocaleDateString('zh-CN')
      }
    }
  } catch (error) {
    console.error(`加载文章 ${decodedCategory}/${decodedSlug} 失败:`, error)
    return null
  }
}

export default async function PostPage({ params }) {
  const {category, slug} = await params
  const decodedParams = {
    category: querystring.unescape(category),
    slug: querystring.unescape(slug)
  }
  const result = await getPost(decodedParams)
  
  if (!result) notFound()

  const { code, frontmatter } = result
  const MDXComponent = getMDXComponent(code)
  return (
    <>
    <article className="max-w-3xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
        <div className="mt-2 text-gray-500">
          <span>{frontmatter.date}</span>
          <span className="mx-2">-----</span>
          <span>{frontmatter.category}</span>
        </div>
        <hr></hr>
      </header>
    </article>
    <>
      <MDXComponent />
    </>
    </>
  )
}

export const revalidate = 3600